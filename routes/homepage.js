const express = require("express");
const router = express.Router();
const homePage = require("../controllers/homepage/homepage");
const getHome = require("../controllers/homepage/getPage-controller");

router.post("/add_homePage", homePage.addHomePage);
router.get("/get_homePage", getHome.getHomepage);

module.exports = router;
