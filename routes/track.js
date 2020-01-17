const express = require("express");
const router = express.Router();

const track = require("../controllers/dtdc/track_order-controller");
const delivery = require("../controllers/dtdc/dtdc_delivery-controller");

router.post("/order", track.track_order);
router.post("/pincode", delivery.check_delivery);

module.exports = router;
