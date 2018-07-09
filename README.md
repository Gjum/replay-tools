# Replay Utils

Utils for working with ReplayMod files (`.mcpr`)

## Usage

`examples/replayToJson.js` dumps all packets in a replay file
as JSON stream (one JSON object (packet) per line) to stdout.

`examples/extractChat.js` showcases the `filter` option
dumping chat packets as JSON stream to stdout and ignoring all other packets.

## API

This library exposes one function: `openReplayFile(path: String, options: { filter = null })`

- `path` is a string specifying the `.mcpr` file path.
- `filter` is an optional function, see [Filtering](#filtering).

`openReplayFile` returns a Promise whose success type is `{ metaData, packetStream }`:

- `metaData` contains info about the `.mcpr` file, see [Metadata](#metadata).
- `packetStream` is a NodeJS `Stream` of packet objects, see [Packet Format](#packet-format).

### Metadata

This is the parsed `metaData.json` directly from the `.mcpr` file:

```js
{
    date: Number, // milliseconds since UNIX epoch
    duration: Number, // duration of the recording in milliseconds
    mcversion: String, // for example "1.12.2"
    players: String[], // UUIDs of all seen players
    serverName: String,
    // ... and some others
}
```

### Packet Format

The stream pushes objects of the following format:

```js
{
    date: Number, // milliseconds since UNIX epoch
    size: Number, // packet size in bytes (without compression)
    id: Number, // packet id
    name: String, // packet name, see minecraft-data
    params: Object, // the actual packet payload
}
```

### Filtering

If you're only interested in certain packets,
you can skip decoding other packets entirely
by passing a function to the `openReplayFile` options
that accepts a single parameter, an object of `{ date, size, id }`,
and returns `true` to decode and push the packet or `false` to ignore it.
