const express = require("express");
const router = express.Router();

const check = require("../controllers/version/check-controller");
const referal = require("../controllers/version/referal-link-controller");

router.get("/check", check.getVersion);
router.get("/url", referal.getUrl);

module.exports = router;
