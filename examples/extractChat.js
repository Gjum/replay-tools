const openReplayFile = require('../')

openReplayFile(process.argv[2] || '/dev/stdin', { filter: ({ id }) => id === 15 })
  .then(({ packetStream }) => {
    packetStream.on('data', ({ params, date }) => {
      console.log(JSON.stringify({ date, message: JSON.parse(params.message) }))
    })
  })
