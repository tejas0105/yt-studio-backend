const fs = require("fs");

const read = fs.createReadStream(
  `./uploads/1706338380120-Pajamas and Nick Drake.mp4`
);

console.log(read);
