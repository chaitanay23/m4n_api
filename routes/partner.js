const express = require("express");
const router = express.Router();

const loginController = require("../controllers/partner/login");
const orderCountController = require("../controllers/partner/orderCount");
const commissionController = require("../controllers/partner/commission");
const userController = require("../controllers/partner/users");
const pincodeController = require("../controllers/partner/highPerformingPincode");
const saleController = require("../controllers/partner/sale");
const logout = require("../controllers/partner/logout");

router.post("/login", loginController.login);
router.post("/order", orderCountController.partnerOrderCount);
router.post("/commission", commissionController.commissionAccrued);
router.post("/user", userController.users);
router.post("/pincode", pincodeController.pincode);
router.post("/sale", saleController.sale);
router.post("/logout", logout.logoutPartner);

module.exports = router;
