const formidable = require('formidable');
const Order = require('../../models/order');
const Product = require('../../models/product');
const Cart = require('../../models/cart');
const Cart_item = require('../../models/cart-item');
const jwt = require('../jwt');
const redis = require('../redis');
const Sequelize = require('sequelize');
const Op = Sequelize.Op

// need to add this functionality will add later
exports.showOrder = (req, res) => {
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
                    var product_attribute = ['id', 'title', 'product_code', 'product_type', 'imageUrl', 'fav', 'description'];
                    var order_attribute = ['id', 'totalPrice', 'totalQuantity', 'status', 'coupon', 'discountAmount', 'netPayable', 'delivery_charges', 'delivery_discount', 'product_gst_tax', 'delivery_gst_tax', 'addressId', 'storeId', 'cartId'];

                    Order.findAll({
                            where: {
                                userId: user_id,
                                orderId:{[Op.eq]:null}
                            },
                            include: [{
                                model: Cart,
                                include: [{
                                    model: Cart_item,
                                    include: [{
                                        model: Product,
                                        attributes: product_attribute
                                    }]
                                }]
                            }],
                            attributes: order_attribute
                        })
                        .then(orders => {
                            if (orders.length > 0) {
                                return res.status(200).json({
                                    status: "true",
                                    message: "your orders",
                                    order: orders
                                });
                            } else {
                                return res.status(204).json({
                                    status: "true",
                                    message: "no order found"
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