const express = require("express");
const router = express.Router();

const loginController = require("../controllers/kiosk/login-controller");
const forgetController = require("../controllers/kiosk/forget_password-controller");
const verifyController = require("../controllers/kiosk/verify_otp-controller");
const user_listController = require("../controllers/kiosk/user_list-controller");
const order_listController = require("../controllers/kiosk/order_list-controller");

router.post("/login", loginController.authenticate);
router.post("/forget-password", forgetController.forget);
router.post("/verify-otp", verifyController.verification);
router.post("/user-list", user_listController.showUser);
router.post("/order-list", order_listController.orders);

module.exports = router;
