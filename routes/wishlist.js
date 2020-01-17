const express = require("express");
const router = express.Router();

const addwishlistController = require("../controllers/wishlist/create-controller");
const showWishlistController = require("../controllers/wishlist/show-controller");

router.post("/add_wishlist", addwishlistController.add_wishlist);
router.post("/show_wishlist", showWishlistController.show_wishlist);

module.exports = router;
