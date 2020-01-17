const express = require("express");
const router = express.Router();

const orderController = require("../controllers/order/order_place-controller");
const showController = require("../controllers/order/show_order-controller");
const readyController = require("../controllers/order/ready_order-controller");
const paymentController = require("../controllers/order/payment_confirm-controller");
const orderDetailController = require("../controllers/order/order_detail-controller");

router.post("/order-detail", orderController.listOrder);
router.post("/show-order", showController.showOrder);
router.post("/readyorder", readyController.readyOrder);
router.post("/payment", paymentController.paymentDetail);
router.post("/show-detail", orderDetailController.orderDetail);

module.exports = router;
