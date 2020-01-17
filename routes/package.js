const express = require("express");
const router = express.Router();

const package = require("../controllers/packages/get-package");
const packageDesc = require("../controllers/packages/package");

router.get("/get", package.getPackages);
router.post("/detail", packageDesc.package);

module.exports = router;
