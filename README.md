# Replay Utils

Utils for working with ReplayMod files (`.mcpr`)

## Usage

`examples/replayToJson.js` dumps all packets in a replay file
as JSON stream (one JSON object (packet) per line) to stdout.

`examples/extractChat.js` showcases the `filter` option
dumping chat packets as JSON stream to stdout and ignoring all other packets.
