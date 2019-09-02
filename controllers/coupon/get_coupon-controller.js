const formidable = require('formidable');
const Coupon = require('../../models/discountCoupon');
const Order = require('../../models/order');
const jwt = require('../jwt');
const redis = require('../redis');


module.exports.coupon = function (req, res) {
    redis.authenticateToken(req.headers.authorization, (result) => {
        if (result == false) {
            const jwt_result = jwt.jwt_verify(req.headers.authorization);

            if (jwt_result && jwt_result != undefined) {
                new formidable.IncomingForm().parse(req, (err, fields) => {
                    if (err) {
                        console.error('Error', err)
                        throw err
                    }

                    const user_id = jwt_result;
                    const coupon = fields["coupon"];

                    Coupon.findOne({
                            where: {
                                name: coupon
                            }
                        })
                        .then(coupon_detail => {
                            if (coupon_detail) {
                                Order.findAndCountAll({
                                        where: [{
                                            userId: user_id
                                        }, {
                                            coupon: coupon
                                        }]
                                    })
                                    .then(order_count => {
                                        if (order_count.count != 0) {
                                            if (order_count.count < coupon_detail.limit_per_user) {
                                                return res.status(200).json({
                                                    status: "true",
                                                    message: "Valid coupon"
                                                });
                                            } else {
                                                return res.status(400).json({
                                                    status: "false",
                                                    message: "Coupon already used by this mobile number"
                                                });
                                            }
                                        } else {
                                            return res.status(200).json({
                                                status: "true",
                                                message: "Valid coupon"
                                            });
                                        }
                                    })
                                    .catch(err => {
                                        return res.status(400).json({
                                            status: "false",
                                            error: err
                                        });
                                    })

                            } else {
                                return res.status(400).json({
                                    status: "false",
                                    message: "Coupon not valid"
                                });
                            }
                        })
                        .catch(err => {
                            return res.status(400).json({
                                status: "false",
                                error: err,
                                message: "Failure"
                            });
                        })
                });
            } else {
                return res.status(400).json({
                    status: "false",
                    message: "Token not verified"
                });
            }
        } else {
            return res.status(400).json({
                status: "false",
                message: "User not Logged In"
            });
        }
    });

}