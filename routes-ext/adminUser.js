const express = require("express");
const router = express.Router();
const multer = require("multer");

const User = require("../controllers-ext/user/user");

router.post("/addAdminUser", User.postAdminUser);
router.post("/getAllUsers'", User.getAllUsers);
router.get("/getUserCount", User.getCustCount);
router.post("/login", User.login);

module.exports = router;
