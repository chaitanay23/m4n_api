const formidable = require('formidable');
const Hand = require('../../models/hand-image');
const Design = require('../../models/design-image');
const Finger = require('../../models/finger-size');
const Cart_item = require('../../models/cart-item');
const Order = require('../../models/order');
const jwt = require('../jwt');
const redis = require('../redis');
const Coupon = require('../../models/discountCoupon');
const delivery = require('../delivery-address');
const GST = require('../../models/gsttax');
const Cart = require('../../models/cart');

exports.readyOrder = (req, res) => {

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
                    const cart_id = fields["cart_id"];
                    const address_id = fields["address_id"];
                    const store_address_id = fields["store_address_id"];
                    const coupon = fields["coupon"];
                    const kiosk_id = fields["kiosk_id"];

                    let hand_id, design_id, finger_id, address_delivery, order_id, get_percent, net_payable, product_gst, delivery_gst, combine_gst;
                    var total_quantity = 0;
                    var total_price = 0;
                    var paid_product_quantity = 0;

                    await Hand.findOne({
                            where: {
                                userId: user_id
                            }
                        })
                        .then(hand => {
                            if (hand) {
                                hand_id = hand.id;
                            } else {
                                hand_id = null;
                            }
                        })
                        .catch(err => {
                            return res.status(400).json({
                                status: "false",
                                error: err,
                                message: "Hand images not found"
                            });
                        });

                    await Finger.findOne({
                            where: {
                                userId: user_id
                            }
                        })
                        .then(finger => {
                            if (finger) {
                                finger_id = finger.id;
                            } else {
                                finger_id = null
                            }
                        })
                        .catch(err => {
                            return res.status(400).json({
                                status: "false",
                                error: err,
                                message: "Finger size failure"
                            });
                        });

                    await Design.findOne({
                            where: {
                                userId: user_id
                            }
                        })
                        .then(design => {
                            if (design) {
                                design_id = design.id;
                            } else {
                                design_id = null;
                            }
                        })
                        .catch(err => {
                            return res.status(400).json({
                                status: "false",
                                error: err,
                                message: "Final design images not found"
                            });
                        });

                    await Cart_item.findAll({
                            where: {
                                cartId: cart_id
                            }
                        })
                        .then(cart_item => {
                            if (cart_item.length > 0) {
                                cart_item.forEach(function (items) {
                                    total_price += items.price;
                                    total_quantity += items.quantity;
                                    if (items.price > 0) {
                                        paid_product_quantity += items.quantity;
                                    }
                                })
                            } else {
                                return res.status(400).json({
                                    status: "false",
                                    message: "Cart items not found"
                                });
                            }
                        })
                        .catch(err => {
                            return res.status(400).json({
                                status: "false",
                                error: err,
                                message: "Cart not found"
                            });
                        });

                    if (coupon) {
                        await Coupon.findOne({
                                where: {
                                    name: coupon
                                }
                            })
                            .then(coupon_detail => {
                                if (coupon_detail) {
                                    coupon_detail.discount_amount = coupon_detail.discount_amount * paid_product_quantity;
                                    coupon_name = coupon_detail.name;
                                    coupon_discount = coupon_detail.discount_amount;
                                } else {
                                    return res.status(400).json({
                                        status: "false",
                                        message: "Coupon not found"
                                    });
                                }
                            })
                            .catch(err => {
                                return res.status(400).json({
                                    status: "false",
                                    error: err,
                                    message: "Coupon details not found"
                                });
                            });
                    } else {
                        coupon_discount = 0;
                        coupon_name = null;
                    }
                    //only 18% is available in db
                    await GST.findOne()
                        .then(gst => {
                            get_percent = gst.tax;
                        })
                        .catch(err => {
                            return res.status(400).json({
                                status: "false",
                                error: err,
                                message: "GST tax not found"
                            });
                        });

                    if ((hand_id || finger_id) != null && coupon_discount >= 0 && total_quantity > 0) {
                        product_gst = total_price * get_percent / 100;
                        if (address_id) {
                            //get delivery charge from address of user
                            delivery.delivery_charge(req.headers.authorization, address_id, (statusCode, delivery_result) => {
                                delivery_result = JSON.parse(delivery_result);
                                if (statusCode == 200) {
                                    address_delivery = delivery_result.delivery_charges;
                                    let delivery_discount, order_delivery;
                                    if (total_price > 0) {
                                        delivery_discount = address_delivery;
                                    } else {
                                        delivery_discount = 0;
                                    }

                                    order_delivery = address_delivery - delivery_discount; //naming convention check
                                    delivery_gst = order_delivery * get_percent / 100;
                                    net_payable = total_price + product_gst - coupon_discount + order_delivery + delivery_gst;
                                    net_payable = parseFloat(net_payable.toFixed(2));
                                    combine_gst = parseFloat((delivery_gst + product_gst).toFixed(2));
                                    Order.create({
                                            userId: user_id,
                                            cartId: cart_id,
                                            addressId: address_id,
                                            handImageId: hand_id,
                                            designImageId: design_id,
                                            fingerSizeId: finger_id,
                                            totalPrice: total_price,
                                            product_gst_tax: product_gst,
                                            delivery_gst_tax: delivery_gst,
                                            totalQuantity: total_quantity,
                                            netPayable: net_payable,
                                            coupon: coupon_name,
                                            discountAmount: coupon_discount,
                                            delivery_charges: address_delivery,
                                            delivery_discount: delivery_discount,
                                            status: "Payment pending",
                                            internalStatus: "pending",
                                            kioskUserId: kiosk_id,
                                        })
                                        .then(async order => {
                                            if (order) {
                                                await Cart.update({
                                                    status: "0"
                                                }, {
                                                    where: {
                                                        id: cart_id,
                                                        status: "1"
                                                    }
                                                });
                                                order_id = order.id;

                                                return res.status(200).json({
                                                    status: "true",
                                                    message: "ready for payment",
                                                    order_id: order_id,
                                                    total_price: total_price,
                                                    total_quantity: total_quantity,
                                                    coupon_discount: coupon_discount,
                                                    delivery_amt: order_delivery,
                                                    gst_tax: combine_gst,
                                                    net_payable: net_payable
                                                });
                                            }
                                        })
                                        .catch(err => {
                                            return res.status(400).json({
                                                status: "false",
                                                error: err,
                                                message: "Unable to process for order"
                                            });
                                        });
                                } else {
                                    return res.status(404).json({
                                        status: "false",
                                        message: "No delivery details found"
                                    });
                                }
                            });
                        } else if (store_address_id) {
                            order_delivery = 0;
                            delivery_discount = 0;
                            delivery_gst = order_delivery * get_percent / 100;
                            net_payable = total_price + product_gst - coupon_discount + order_delivery + delivery_gst;
                            net_payable = parseFloat(net_payable.toFixed(2));
                            combine_gst = parseFloat((delivery_gst + product_gst).toFixed(2));

                            Order.create({
                                    userId: user_id,
                                    cartId: cart_id,
                                    storeId: store_address_id,
                                    handImageId: hand_id,
                                    designImageId: design_id,
                                    fingerSizeId: finger_id,
                                    totalPrice: total_price,
                                    product_gst_tax: product_gst,
                                    delivery_gst_tax: delivery_gst,
                                    totalQuantity: total_quantity,
                                    netPayable: net_payable,
                                    coupon: coupon_name,
                                    discountAmount: coupon_discount,
                                    delivery_charges: order_delivery,
                                    delivery_discount: delivery_discount,
                                    status: "Payment pending",
                                    internalStatus: "pending",
                                    kioskUserId: kiosk_id,
                                })
                                .then(async order => {
                                    if (order) {
                                        await Cart.update({
                                            status: "0"
                                        }, {
                                            where: {
                                                id: cart_id,
                                                status: "1"
                                            }
                                        });
                                        order_id = order.id;

                                        return res.status(200).json({
                                            status: "true",
                                            message: "ready for payment",
                                            order_id: order_id,
                                            total_price: total_price,
                                            total_quantity: total_quantity,
                                            coupon_discount: coupon_discount,
                                            delivery_amt: order_delivery,
                                            gst_tax: combine_gst,
                                            net_payable: net_payable
                                        });
                                    }
                                })
                                .catch(err => {
                                    return res.status(400).json({
                                        status: "false",
                                        error: err,
                                        message: "Unable to process for order"
                                    });
                                });
                        } else {
                            return res.status(400).json({
                                status: "false",
                                message: "Please provide delivery address"
                            });
                        }
                    } else {
                        return res.status(400).json({
                            status: "false",
                            message: "Failure"
                        })
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