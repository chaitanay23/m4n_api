const express = require("express");
const router = express.Router();
const categorytypeController = require("../controllers-ext/packages/packages");

router.post("/addPackage", categorytypeController.addPackages);
router.post("/getPackage", categorytypeController.getSinglePackage);
router.put("/updatePackage", categorytypeController.updatePackage);
router.post("/allPackages", categorytypeController.getAllPackges);

module.exports = router;
