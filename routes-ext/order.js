const express = require("express");
const router = express.Router();
const orderController = require("../controllers-ext/order/order");

router.get("/getOrderCount", orderController.countOrders);
router.get("/getTotalRevenue", orderController.calRevenue);
router.post("/getGPh", orderController.getGraphDetails);
router.get("/currentOrders", orderController.getCurrentOrders);

module.exports = router;
