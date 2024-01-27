const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const youtube = require("youtube-api");
const path = require("path");
const { google } = require("googleapis");

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());
dotenv.config({ path: `${__dirname}/config.env` });

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// oauth2Client.setCredentials({
//   access_token:
//     "ya29.a0AfB_byBP2-xGENzt6ofVTG7-n8iTG7J42Imo1h1ykC9SGtii3WQ0d_VxGOtI5TerwFV84NElYadNVelI5YYb6f8cwVTEQ1v1jIjJj4wHqvCd3S_se9MSGgAY1ELFPvtB837ZllcuLIVsvV8lkDUc1JtP030mXDElaqb_aCgYKAQQSARESFQHGX2MisDfum_2krfOPEFfoTqbL-A0171",
// });
// console.log(oauth2Client);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const uploadFile = multer({
  storage: storage,
}).single("file");

const scopes = [
  "https://www.googleapis.com/auth/youtube.readonly",
  "openid",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/youtube.force-ssl",
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube",
  "https://www.googleapis.com/auth/youtubepartner",
];

app.get("/request", async (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  });
  // console.log(url);
  // res.send(`<a href=${url}>Sign in</a>`);
  res.status(200).json({ status: "success", link: url });
});

app.get("/oauth", async (req, res) => {
  const code = req.query.code;
  const { tokens } = await oauth2Client.getToken(code);
  const auth = oauth2Client.setCredentials(tokens);
  console.log(auth);
  res.cookie("access_token", tokens.access_token, {
    expires: new Date(tokens.expiry_date),
  });
  res.redirect("http://localhost:5173/dashboard");
});

app.post("/upload", uploadFile, async (req, res) => {
  const service = google.youtube({ version: "v3" });
  const fileName = req.file.filename;
  console.log(fileName);
  console.log(req.body.access_token);

  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: `${req.body.access_token}`,
  });
  console.log(oauth2Client);

  try {
    const resp = await service.videos.insert({
      auth: oauth2Client,
      part: "id,snippet,status",
      notifySubscribers: false,
      requestBody: {
        snippet: {
          title: "Node.js YouTube Upload Test",
          description: "Testing YouTube upload via Google APIs Node.js Client",
        },
        status: {
          privacyStatus: "private",
        },
      },
      media: {
        body: fs.createReadStream(`./uploads/${fileName}`),
      },
    });
    console.log("resp->", Object.keys(resp));
    // console.log(auth);
    return res.status(resp.status).json({
      status: "success",
      message: "Video successfully uploaded to YouTube",
    });
  } catch (error) {
    return res
      .status(400)
      .json({ status: "failed", message: "something went wrong" });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server started listening on http://localhost:${port}`);
});
