const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const youtube = require("youtube-api");
const path = require("path");

const getGoogleOAuthURL = require("./getGoogleURL");
const getGoogleOAuthTokens = require("./getGoogleOAuthTokens");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// console.log(storage);

const app = express();
app.use(express.json());
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

const upload = multer({ storage });

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    // console.log(req.body);
    console.log(req.cookies);
    try {
      const postVideo = async () => {
        const resp = await fetch(
          `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2Cstatus&key=${process.env.API_KEY}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${req.cookies.access_token}`,
              Accept: "application/json",
              "Content-Type": "application/json application/octet-stream",
            },
            body: JSON.stringify({
              snippet: {
                description: "Description of uploaded video.",
                title: "Test video upload.",
              },
              status: {
                privacyStatus: "private",
              },
              media: fs.createReadStream(
                path.join("./uploads", req.file.filename)
              ),
            }),
          }
        );
        const data = await resp.json();
        console.log(data);
      };
      postVideo();
    } catch (error) {
      console.log(error.message);
    }
    // console.log(fs.createReadStream(path.join("./uploads", req.file.filename)));

    return res.status(200).json({
      status: "success",
      data: { message: "file successfully received", file: req.file },
    });
  } catch (error) {
    return res.status(400).json({ status: "error", message: "bad request" });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server started listening on http://localhost:${port}`);
});
