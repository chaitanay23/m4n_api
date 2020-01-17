const express = require("express");
const router = express.Router();

const accessories = require("../controllers/accessories/get_list-controller");
const accessDec = require("../controllers/accessories/accessory_detail");

router.get("/get", accessories.getAccessories);
router.post("/detail", accessDec.nail_kit);

module.exports = router;
