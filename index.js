const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const router = require("./routes/routes");

const app = express();
dotenv.config({ path: "./.env" });
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use("/", router);

const a = `${__dirname}/.env`;
console.log(a);

const port = 3000;
app.listen(port, () => {
  console.log(`Server started listening on http://localhost:${port}`);
});
