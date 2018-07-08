const { Readable, Transform } = require('stream')

const getMcDataForVersion = require('minecraft-data')
const { ProtoDef } = require('protodef')
const yauzl = require('yauzl')

const minecraftDatatypes = require('./minecraftDatatypes')

module.exports = openReplayFile

function createMcProtocol(state, direction, version) {
  const proto = new ProtoDef(false)
  proto.addTypes(minecraftDatatypes)
  const mcDataAtVersion = getMcDataForVersion(version)
  proto.addProtocol(mcDataAtVersion.protocol, [state, direction])
  return proto
}

class Parser extends Transform {
  constructor(proto) {
    super({ readableObjectMode: true })
    this.proto = proto
    this.queue = Buffer.alloc(0)
  }

  _transform(chunk, enc, cb) {
    this.queue = Buffer.concat([this.queue, chunk])
    while (true) {
      let packet, size
      try {
        const time = this.queue.readUInt32BE(0)
        size = this.queue.readUInt32BE(4)
        packet = this.proto.parsePacketBuffer('packet', this.queue.slice(8, 8 + size))
        packet.metadata.time = time
      }
      catch (e) {
        if (e.partialReadError || e instanceof RangeError) {
          return cb()
        } else {
          e.buffer = this.queue
          this.queue = new Buffer(0)
          return cb(e)
        }
      }

      this.push(packet)
      this.queue = this.queue.slice(8 + size)
    }
  }
}

/**
 * @typedef {{date: Number, duration: Number, mcversion: String, players: String[], selfId: Number, serverName: String}} MCPRMetaData
 * @returns {Promise<{metaData: MCPRMetaData, packetStream: Readable}>}
 */
function openReplayFile(path) {
  return new Promise((resolve, reject) => {
    yauzl.open(path, { lazyEntries: false }, (err, zipfile) => {
      if (err) return reject(err)
      // read both, then resolve
      let metaData, recordingStream
      zipfile.on("entry", entry => {
        if ('recording.tmcpr' === entry.fileName) {
          zipfile.openReadStream(entry, (err, stream) => {
            if (err) reject(err)
            recordingStream = stream
            if (metaData) resolve({ metaData, recordingStream, zipfile })
          })
        }
        if ('metaData.json' === entry.fileName) {
          zipfile.openReadStream(entry, (err, stream) => {
            if (err) reject(err)
            const chunks = []
            stream.on("close", () => reject('metaData.json stream closed'))
            stream.on("error", (err) => reject(err))
            stream.on("data", (chunk) => chunks.push(chunk))
            stream.on("end", () => {
              metaData = JSON.parse(Buffer.concat(chunks).toString())
              if (recordingStream) resolve({ metaData, recordingStream, zipfile })
            })
          })
        }
      })
    })
  }).then(({ metaData, recordingStream }) => {
    const parser = new Parser(createMcProtocol('play', 'toClient', metaData.mcversion))
    const packetStream = recordingStream.pipe(parser)
    return { metaData, packetStream }
  })
}
