// const express = require("express");
// const dotenv = require("dotenv");
// const cookieParser = require("cookie-parser");
// const cors = require("cors");
// const multer = require("multer");
// const fs = require("fs");
// const youtube = require("youtube-api");
// const path = require("path");
// const { google } = require("googleapis");

// const getGoogleOAuthURL = require("./getGoogleURL");
// const getGoogleOAuthTokens = require("./getGoogleOAuthTokens");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     return cb(null, "./uploads");
//   },
//   filename: function (req, file, cb) {
//     return cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });

// // console.log(storage);

// const app = express();
// app.use(express.json());
// app.use(cors());
// app.use(cookieParser());
// dotenv.config({ path: `${__dirname}/config.env` });

// app.get("/request", async (req, res) => {
//   let link = await getGoogleOAuthURL();
//   res.status(200).json({ status: "success", link: link });
// });

// app.get("/oauth", async (req, res) => {
//   const code = req.query.code;
//   const { access_token, expires_in, refresh_token } =
//     await getGoogleOAuthTokens(code);
//   res.cookie("access_token", access_token, {
//     expires: new Date(Date.now() + expires_in * 1000),
//   });

//   res.cookie("refresh_token", refresh_token, {
//     expires: new Date(Date.now() + 3.156e10),
//   });
//   //   console.log(data);
//   res.redirect("http://localhost:5173/dashboard");
// });
// // app.get("/data", (req, res) => {
// //   res.cookie("cookie", "cookie", {
// //     expires: new Date(Date.now() + 3600000),
// //   });
// //   res.json({message: "cookie sent successfully"})
// // });

// const upload = multer({ storage });

// app.post("/upload", upload.single("file"), async (req, res) => {
//   try {
//     // console.log(req.body);
//     console.log("cookies->", req.cookies);
//     try {
//       const postVideo = async () => {
//         const resp = await fetch(
//           `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2Cstatus&key=${process.env.API_KEY}`,
//           {
//             method: "POST",
//             headers: {
//               Authorization: `Bearer ya29.a0AfB_byB8A_pQ27Rhrb43iSo3QM_o9ko4vlNXbAfzlQ-RBkIxTeHR12cQ_rvYR8Eyq9BUvli9f5VHB3MJv-g7IK5KAwsq9S9Xk2j2PaJu2w1wPgOO34KIaVbzDO8lMSrc-b-POyw70zbZZ8zyIqGVQPV3Oo_A7UFommjnaCgYKAWkSARESFQHGX2Mit0iK8UBgcmMS2OWFv_IqjA0171`,
//               Accept: "multipart/form-data",
//               "Content-Type": "application/json application/octet-stream",
//             },
//             body: JSON.stringify({
//               snippet: {
//                 description: "Description of uploaded video.",
//                 title: "Test video upload.",
//               },
//               status: {
//                 privacyStatus: "private",
//               },
//             }),
//             media: {
//               body: fs.createReadStream(
//                 path.join("./uploads", req.file.filename)
//               ),
//             },
//           }
//         );
//         const data = await resp.json();
//         console.log("data->", data);
//       };
//       postVideo();
//     } catch (error) {
//       console.log(error.message);
//     }
//     // console.log(fs.createReadStream(path.join("./uploads", req.file.filename)));

//     return res.status(200).json({
//       status: "success",
//       data: { message: "file successfully received", file: req.file },
//     });
//   } catch (error) {
//     return res.status(400).json({ status: "error", message: "bad request" });
//   }
// });

// const port = 3000;
// app.listen(port, () => {
//   console.log(`Server started listening on http://localhost:${port}`);
// });
