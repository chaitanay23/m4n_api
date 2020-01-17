const express = require("express");
const router = express.Router();

const videoController = require("../controllers/video-link/show_video-controller");

router.post("/show-link", videoController.getVideo);

module.exports = router;
