const express = require("express");
const router = express.Router();
const multer = require("multer");

const User = require("../controllers-ext/user/user");

router.post("/addAdminUser", User.postAdminUser);
router.post("/getAllUsers", User.getAllUsers);
router.get("/factoryUsers", User.getFactoryUsers);
router.get("/customerCareUser", User.getCustomerCareUsers);
router.get("/partners", User.getPartners);
router.get("/getUserCount", User.getCustCount);
router.post("/login", User.login);

module.exports = router;
