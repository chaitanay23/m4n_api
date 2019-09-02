    const formidable = require('formidable');
    const Cart_item = require('../../models/cart-item');
    const Address = require('../../models/address');
    const Store = require('../../models/store');
    const jwt = require('../jwt');
    const redis = require('../redis');
    const GST = require('../../models/gsttax');
    const Product = require('../../models/product');
    const Coupon = require('../../models/discountCoupon');

    exports.listOrder = (req, res) => {

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
                        let cart_detail, address_detail, store_detail;
                        let product_describe = [];
                        let total_price = 0;
                        let total_quantity = 0;
                        let order_delivery = 0;
                        let delivery_discount = 0;
                        let get_percent = 0;
                        let product_gst = 0;
                        let delivery_gst = 0;
                        let combine_gst = 0;
                        let net_payable = 0;
                        let paid_product_quantity = 0;
                        if (!cart_id) {
                            return res.status(400).json({
                                status: "false",
                                message: "please provide cart_id"
                            });
                        }
                        await Cart_item.findAll({
                                where: {
                                    cartId: cart_id
                                }
                            })
                            .then(async cart_product => {
                                if (cart_product) {
                                    await cart_product.forEach(item => {
                                        if (item) {
                                            total_price += item.price;
                                            total_quantity += item.quantity;
                                            if (item.price > 0) {
                                                paid_product_quantity += item.quantity;
                                            }
                                            Product.findOne({
                                                    where: {
                                                        id: item.productId
                                                    }
                                                })
                                                .then(product => {
                                                    result_json = {
                                                        "name": product.title,
                                                        "quantity": item.quantity,
                                                        "price": item.price
                                                    }
                                                    product_describe.push(result_json);
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

                                    cart_detail = product_describe;
                                }
                            })
                            .catch(err => {
                                return res.status(400).json({
                                    status: "false",
                                    error: err,
                                    message: "Failure"
                                });
                            });
                            
                        if (address_id) {
                            await Address.findOne({
                                    where: {
                                        id: address_id,
                                        userId: user_id
                                    }
                                })
                                .then(async delivery_address => {
                                    if (delivery_address) {
                                        address_detail = delivery_address;

                                        await Store.findOne({
                                                where: {
                                                    id: delivery_address.storeId
                                                }
                                            })
                                            .then(store => {
                                                if (store) {
                                                    store_detail = store.delivery_charges;
                                                } else {
                                                    store_detail = 50;
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
                                            message: "Please provide address id"
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

                            address_delivery = store_detail;

                            if (total_price > 0) {
                                delivery_discount = address_delivery;
                            } else {
                                delivery_discount = 0;
                            }

                            order_delivery = address_delivery - delivery_discount;


                        } else if (store_address_id) {
                            order_delivery = 0;
                            delivery_discount = 0;
                            await Store.findOne({
                                    where: {
                                        id: store_address_id
                                    }
                                })
                                .then(store_delivery => {
                                    address_detail = store_delivery;
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
                                message: "Please select delivery address"
                            });
                        }
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
                        
                        await GST.findOne()
                            .then(gst => {
                                get_percent = gst.tax;
                            })
                            .catch(err => {
                                return res.status(400).json({
                                    status: "false",
                                    error: err,
                                    message: "Failure"
                                });
                            });
                        product_gst = total_price * get_percent / 100;
                        delivery_gst = order_delivery * get_percent / 100;
                        combine_gst = parseFloat((delivery_gst + product_gst).toFixed(2));
                        net_payable = total_price + order_delivery + combine_gst - coupon_discount;
                        net_payable = parseFloat(net_payable.toFixed(2));

                        return res.status(200).json({
                            status: "true",
                            message: "order details",
                            address_detail: address_detail,
                            cart_item: cart_detail,
                            total_price: total_price,
                            total_quantity: total_quantity,
                            coupon_discount: coupon_discount,
                            delivery_amt: order_delivery,
                            gst_tax: combine_gst,
                            net_payable: net_payable
                        });
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