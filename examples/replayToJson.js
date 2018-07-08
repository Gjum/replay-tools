const openReplayFile = require('../')

openReplayFile(process.argv[2] || '/dev/stdin')
  .then(({ metaData, packetStream }) => {
    packetStream.on('data', ({ data, metadata: { time } }) => {
      console.log(JSON.stringify({ data, time }))
    })
  })
