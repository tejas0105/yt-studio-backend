const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
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

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const scopes = [
  "https://www.googleapis.com/auth/youtube.readonly",
  "openid",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/youtube.force-ssl",
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube",
  "https://www.googleapis.com/auth/youtubepartner",
];

const uploadFile = multer({
  storage: storage,
});

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

app.post(
  "/upload",
  uploadFile.fields([{ name: "videoFile" }, { name: "imgFile" }]),
  async (req, res) => {
    const service = google.youtube({ version: "v3" });
    const videoFile = req.files.videoFile[0].filename;

    const imgData = req.files.imgFile[0].filename;

    // console.log(req.body.access_token);

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
      const resp = await service.videos.insert(
        {
          auth: oauth2Client,
          part: "id,snippet,status",
          notifySubscribers: false,
          requestBody: {
            snippet: {
              title: `${req.body.title}`,
              description: `${req.body.description}`,
            },
            status: {
              privacyStatus: "private",
            },
          },
          media: {
            body: fs.createReadStream(`./uploads/${videoFile}`),
          },
        },
        function (err, response) {
          if (err) {
            console.log("The API returned an error: " + err);
            return res.status(err.code).json({
              status: "failed",
              message: err,
            });
          }
          // console.log("video response ->", response?.data);

          if (imgData) {
            console.log("Video uploaded. Uploading the thumbnail now.");
            service.thumbnails.set({
              auth: oauth2Client,
              videoId: response?.data?.id,
              media: {
                body: fs.createReadStream(`./uploads/${imgData}`),
              },
            });
          }
          return res.status(200).json({
            status: "success",
            data: {
              uploadStatus: response?.uploadStatus,
            },
          });
        }
      );
      // console.log("resp->", Object.keys(resp));
      // console.log(auth);
      console.log("resp->", resp);

      setTimeout(() => {
        fs.unlink(
          `./uploads/${videoFile}`,
          (err) => {
            if (err) throw new Error("something wasn't right");
            console.log("File deleted successfully");
          },
          5000
        );
        fs.unlink(`./uploads/${imgData}`, (err) => {
          if (err) throw new Error("something wasn't right");
          console.log("File deleted successfully");
        });
      }, 5000);
    } catch (error) {
      console.log(error.message);
      return res
        .status(400)
        .json({ status: "failed", message: "something went wrong" });
    }
  }
);

const port = 3000;
app.listen(port, () => {
  console.log(`Server started listening on http://localhost:${port}`);
});
