const express = require("express");
const router = express.Router();

const addtoCart = require("../controllers/cart/addto_cart-controller");
const showCart = require("../controllers/cart/show_cart-controller");
const cartPrice = require("../controllers/cart/cart_price-controller");
const cartQuantity = require("../controllers/cart/cart_quantity-controller");
const cartCount = require("../controllers/cart/cart_count-controller");

router.post("/addcart", addtoCart.addCart);
router.post("/showcart", showCart.showCart);
router.post("/cart-price", cartPrice.price);
// router.post('/update-quantity',cartQuantity.addQuantity);
router.post("/remove-package", cartQuantity.removeProduct);
router.post("/cart-count", cartCount.count);

module.exports = router;
