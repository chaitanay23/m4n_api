const express = require("express");
const router = express.Router();

const get_list = require("../controllers/preset/gallery_list-controller");
const detail = require("../controllers/preset/preset_detail-controller");

router.post("/get_list", get_list.preset_list);
router.post("/detail", detail.set_detail);

module.exports = router;
