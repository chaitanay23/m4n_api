const express = require("express");
const router = express.Router();
const categorytypeController = require("../controllers-ext/packages/packages");

router.post("/addPackage", categorytypeController.addPackages);
router.post("/getPackage", categorytypeController.getSinglePackage);
router.put("/updatePackage", categorytypeController.updatePackage);
router.get("/allPackages", categorytypeController.getAllPackges);
router.post("/updateflag", categorytypeController.upDateFlag);
router.post("/updateCustomize", categorytypeController.upDateCustomize);

module.exports = router;
