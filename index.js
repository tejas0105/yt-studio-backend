const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const router = require("./routes/routes");

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use("/", router);

const port = 3000;
app.listen(port, () => {
  console.log(`Server started listening on http://localhost:${port}`);
});
