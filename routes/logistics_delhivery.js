const express = require("express");
const router = express.Router();

const logistic = require("../controllers/logistics/delhivery_controller");

router.post("/pincode", logistic.is_Serviceable);
router.post("/order_track", logistic.track_order);

module.exports = router;
