const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const getGoogleOAuthURL = require("./getGoogleURL");
const getGoogleOAuthTokens = require("./getGoogleOAuthTokens");

const app = express();
app.use(cors());
app.use(cookieParser());
dotenv.config({ path: `${__dirname}/config.env` });

app.get("/request", async (req, res) => {
  let link = await getGoogleOAuthURL();
  res.status(200).json({ status: "success", link: link });
});

app.get("/oauth", async (req, res) => {
  const code = req.query.code;
  const { access_token, expires_in, refresh_token } =
    await getGoogleOAuthTokens(code);
  res.cookie("access_token", access_token, {
    expires: new Date(Date.now() + expires_in * 1000),
  });

  res.cookie("refresh_token", refresh_token, {
    expires: new Date(Date.now() + 3.156e10),
  });
  //   console.log(data);
  res.redirect("http://localhost:5173/dashboard");
});
// app.get("/data", (req, res) => {
//   res.cookie("cookie", "cookie", {
//     expires: new Date(Date.now() + 3600000),
//   });
//   res.json({message: "cookie sent successfully"})
// });

const port = 3000;
app.listen(port, () => {
  console.log(`Server started listening on http://localhost:${port}`);
});
