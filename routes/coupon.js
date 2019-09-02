const express=require("express");
const router = express.Router();

const discount_coupon = require('../controllers/coupon/get_coupon-controller');
const get_coupon = require('../controllers/coupon/all_coupon-controller');


router.post('/getCoupon',discount_coupon.coupon);
router.post('/allCoupon',get_coupon.all_coupon);


module.exports = router;
