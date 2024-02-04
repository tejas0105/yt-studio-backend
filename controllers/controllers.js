const multer = require("multer");
const dotenv = require("dotenv");
const fs = require("fs");
const { google } = require("googleapis");
dotenv.config({ path: "./.env" });

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

const multiUpload = uploadFile.fields([
  { name: "videoFile" },
  { name: "imgFile" },
]);

const request = async (req, res) => {
  try {
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      prompt: "consent",
    });
    return res.status(200).json({ status: "success", link: url });
  } catch (error) {
    return res.status(400).json({ status: "failed", message: "Bad request" });
  }
};

const oauth = async (req, res) => {
  try {
    const code = req.query.code;
    const { tokens } = await oauth2Client.getToken(code);
    console.log(tokens);
    res.cookie("access_token", tokens.access_token, {
      expires: new Date(tokens.expiry_date),
    });
    return res.redirect("http://localhost:5173/dashboard");
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ status: "failed", message: "Internal server error" });
  }
};

const upload = async (req, res) => {
  const service = google.youtube({ version: "v3" });

  const videoFile = req.files.videoFile[0].filename;
  const imgData = req.files.imgFile[0].filename;

  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: `${req.body.access_token}`,
  });

  try {
    await service.videos.insert(
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
};

module.exports = { request, oauth, upload, multiUpload };
