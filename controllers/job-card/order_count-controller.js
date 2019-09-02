const formidable = require('formidable');
const Order = require('../../models/order');
const jwt = require('../jwt');
const redis = require('../redis');

exports.countOrder = (req, res) => {
    redis.authenticateToken(req.headers.authorization, (result) => {
        if (result == false) {
            const jwt_result = jwt.jwt_verify(req.headers.authorization);

            if (jwt_result && jwt_result != undefined) {
                new formidable.IncomingForm().parse(req, async (err, fields) => {
                    if (err) {
                        console.error('Error', err)
                        throw err
                    }

                    const status = fields["internalStatus"];

                    if (status != null) {
                        Order.findAndCountAll({
                                where: {
                                    internalStatus: status
                                }
                            })
                            .then(order_count => {
                                if (order_count.count != 0) {
                                    return res.status(200).json({
                                        status: "true",
                                        message: "Order count",
                                        order_count: order_count.count
                                    });
                                } else {
                                    return res.status(200).json({
                                        status: "true",
                                        message: "No order found",
                                        order_count:0
                                    });
                                }
                            })
                            .catch(err => {
                                return res.status(400).json({
                                    status:"false",
                                    error: err
                                });
                            })
                    }
                });
            } else {
                return res.status(400).json({
                    status:"false",
                    message: "Token not verified"
                });
            }
        } else {
            return res.status(400).json({
                status:"false",
                message: "User not Logged In"
            });
        }
    });
}