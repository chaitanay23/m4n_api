const express = require("express");
const router = express.Router();
const presetController = require("../controllers-ext/preset/preset");
const multer = require("multer");

var upload = multer({ dest: "images/" });

router.post("/addPreset", upload.any(), presetController.addPreset);
router.get("/getPreset", presetController.getAllPreset);
router.put("/updatePreset", upload.any(), presetController.updatePreset);
router.post("/getSinglePreset", presetController.getSinglePreset);
router.post("/updateHot_sell", presetController.updateHot_sell);
router.post("/updateNew_sell", presetController.updateNew_sell);

module.exports = router;
