const openReplayFile = require("../");

const replayPath = process.argv[2] || "/dev/stdin";
const pktIdStr = process.argv[3];

let filter = ({ id }) => ![0x22].includes(id) // default filter: skip chunk packets in 1.18.2
if (pktIdStr !== undefined) {
  const pktIds = pktIdStr.split(/[^0-9]+/g).filter(s => s).map((s) => +s);
  console.error(`Filtering for packets ${pktIds}`);
  filter = ({ id }) => pktIds.includes(id);
}

let numPacketsProcessed = 0;

openReplayFile(replayPath, { filter }).then(({ metaData, packetStream }) => {
  packetStream.on("data", (packet) => {
    ++numPacketsProcessed;
    console.log(JSON.stringify(packet));
  });
  packetStream.on("error", (err) => console.error(`Error:`, err));
  packetStream.on("end", () =>
    console.error(numPacketsProcessed, `packets processed`)
  );
});
