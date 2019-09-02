const Order = require('../../models/order');
const jwt = require('../jwt');
const redis = require('../redis');
const formidable = require('formidable');
const Payment = require('../../models/payment');

exports.paymentDetail = (req, res) => {

    redis.authenticateToken(req.headers.authorization, (result) => {
        if (result == false) {

            const jwt_result = jwt.jwt_verify(req.headers.authorization);

            if (jwt_result && jwt_result != undefined) {

                new formidable.IncomingForm().parse(req, async (err, fields, files) => {
                    if (err) {
                        console.error('Error', err)
                        throw err
                    }
                    const user_id = jwt_result;
                    const order_id = fields["order_id"];
                    const tracking_id = fields["tracking_id"];
                    const amount = fields["amount"];
                    const currency = fields["currency"];
                    const bank_ref_no = fields["bank_ref_no"];
                    const payment_mode = fields["payment_mode"];
                    const card_number = fields["card_number"];
                    const order_status = fields["order_status"];
                    const status_message = fields["status_message"];
                    const status_code = fields["status_code"];
                    let net_payable = 0;
                    let comment = null;
                    if (user_id) {
                        Order.findOne({
                                where: {
                                    userId: user_id,
                                    id: order_id,
                                    internalStatus: 'pending'
                                }
                            })
                            .then(pending_order => {
                                if (pending_order) {
                                    net_payable = pending_order.net_payable;
                                    if (order_status == "Success") {
                                        if (net_payable != amount) {
                                            comment = "Fault! Incorrect price recieved.";
                                        }

                                        Payment.create({
                                                tracking_id: tracking_id,
                                                amount: amount,
                                                currency: currency,
                                                bank_ref_no: bank_ref_no,
                                                payment_mode: payment_mode,
                                                card_number: card_number,
                                                order_status: order_status,
                                                status_message: status_message,
                                                status_code: status_code,
                                                comment: comment
                                            })
                                            .then(payment_received => {
                                                if (payment_received) {
                                                    Order.update({
                                                            status: "Order placed successfully!",
                                                            internalStatus: "fresh",
                                                            paymentId: payment_received.id,
                                                        }, {
                                                            where: {
                                                                id: order_id
                                                            }
                                                        })
                                                        .then(order_placed => {
                                                            if (order_placed != 0) {
                                                                return res.status(200).json({
                                                                    status: "true",
                                                                    message: "Order successfully placed",
                                                                    order_id: order_id
                                                                });
                                                            } else {
                                                                return res.status(400).json({
                                                                    status: "false",
                                                                    message: "Failure"
                                                                });
                                                            }
                                                        })
                                                        .catch(err => {
                                                            return res.status(400).json({
                                                                status: "false",
                                                                error: err,
                                                                message: "Failure"
                                                            });
                                                        });
                                                } else {
                                                    return res.status(400).json({
                                                        status: "false",
                                                        message: "Failure"
                                                    });
                                                }
                                            })
                                            .catch(err => {
                                                return res.status(400).json({
                                                    status: "false",
                                                    error: err,
                                                    message: "Failure"
                                                });
                                            });

                                    } else {
                                        comment = "Payment failed from gateway";
                                        Payment.create({
                                                tracking_id: tracking_id,
                                                amount: amount,
                                                currency: currency,
                                                bank_ref_no: bank_ref_no,
                                                payment_mode: payment_mode,
                                                card_number: card_number,
                                                order_status: order_status,
                                                status_message: status_message,
                                                status_code: status_code,
                                                comment: comment
                                            })
                                            .then(payment_failed => {
                                                if (payment_failed) {
                                                    Order.update({
                                                            status: "Payment Failed!",
                                                            internalStatus: "failed",
                                                            paymentId: payment_failed.id
                                                        }, {
                                                            where: {
                                                                id: order_id
                                                            }
                                                        })
                                                        .then(failed_order => {
                                                            if (failed_order != 0) {
                                                                return res.status(200).json({
                                                                    status: "true",
                                                                    message: "Order failed",
                                                                    order_id: order_id
                                                                });
                                                            } else {
                                                                return res.status(400).json({
                                                                    status: "false",
                                                                    message: "Failure"
                                                                });
                                                            }
                                                        })
                                                        .catch(err => {
                                                            return res.status(400).json({
                                                                status: "false",
                                                                error: err,
                                                                message: "Failure"
                                                            });
                                                        });
                                                }
                                            });

                                    }
                                } else {
                                    return res.status(400).json({
                                        status: "false",
                                        message: "Please provide valid order"
                                    })
                                }
                            })
                    } else {
                        return res.status(400).json({
                            status: "false",
                            error: err,
                            message: "Failure"
                        });
                    }

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