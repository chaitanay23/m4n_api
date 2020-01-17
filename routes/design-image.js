const express = require("express");
const router = express.Router();

const designUpload = require("../controllers/design-image/design_upload-controller");
const showDesign = require("../controllers/design-image/design_show-controller");

router.post("/upload", designUpload.design_image);
router.post("/show", showDesign.design_show);

module.exports = router;
