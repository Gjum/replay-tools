const openReplayFile = require('../')

openReplayFile(process.argv[2] || '/dev/stdin')
  .then(({ metaData, packetStream }) => {
    packetStream.on('data', (packet) => {
      console.log(JSON.stringify(packet))
    })
  })
