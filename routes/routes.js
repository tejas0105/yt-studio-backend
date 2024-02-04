const express = require("express");
const {
  request,
  oauth,
  upload,
  multiUpload,
} = require("./../controllers/controllers");

const router = express.Router();

router.route("/request").get(request);
router.route("/oauth").get(oauth);
router.route("/upload").post(multiUpload, upload);

module.exports = router;
