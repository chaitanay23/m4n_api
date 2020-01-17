const express = require("express");
const router = express.Router();

const handUpload = require("../controllers/hand-image/upload");
const showHand = require("../controllers/hand-image/show_hand-controller");
const tokenVerify = require("../controllers/hand-image/token_validation-controller");

router.post("/upload", handUpload.upload_image);
router.post("/show", showHand.hand_show);
router.post("/token", tokenVerify.token);

module.exports = router;
