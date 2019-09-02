const formidable = require('formidable');
const Cart = require('../../models/cart');
const Cart_item = require('../../models/cart-item');
const jwt = require('../jwt');
const redis = require('../redis');
const Product = require('../../models/product');

exports.addQuantity = (req, res) => {
    redis.authenticateToken(req.headers.authorization, (result) => {
        if (result == false) {
            const jwt_result = jwt.jwt_verify(req.headers.authorization);

            if (jwt_result && jwt_result != undefined) {
                new formidable.IncomingForm().parse(req, async (err, fields, files) => {
                    if (err) {
                        console.error('Error', err)
                        throw err
                    }
                    const cart_id = fields["cart_id"];
                    const user_id = jwt_result;
                    const cart_item_id = fields["cart_item_id"];
                    const quantity = fields["quantity"];
                    const product_id = fields["product_id"];
                    let product_price = 0;
                    let total_price = 0;
                    let product_set = [];
                    if (!parseInt(quantity, 10)) {
                        return res.status(400).json({
                            status: "false",
                            message: "Please provide correct value"
                        });
                    }

                    await Product.findAll({
                            where: {
                                product_type: 'free_nail'
                            }
                        })
                        .then(free_product => {
                            if (free_product.length > 0) {
                                free_product.forEach(element => {
                                    product_set.push(element.id)
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
                    if (product_id) {
                        await Product.findOne({
                                where: {
                                    id: product_id
                                }
                            })
                            .then(product => {
                                product_price = product.price;
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
                            message: "Please provide product id"
                        });
                    }

                    if (cart_id && user_id && cart_item_id && quantity) {
                        Cart.findOne({
                                where: {
                                    id: cart_id,
                                    userId: user_id
                                }
                            })
                            .then(cart => {
                                if (cart) {
                                    Cart_item.findOne({
                                            where: {
                                                cartId: cart.id,
                                                id: cart_item_id
                                            }
                                        })
                                        .then(cart_item => {
                                            if (cart_item) {
                                                if (product_set.includes(cart_item.productId)) {
                                                    return res.status(400).json({
                                                        status: "false",
                                                        message: "Only 1 free product per user"
                                                    });
                                                } else {
                                                    total_price = product_price * quantity;
                                                    console.log(total_price);
                                                    Cart_item.update({
                                                            quantity: quantity,
                                                            price: total_price
                                                        }, {
                                                            where: {
                                                                id: cart_item_id
                                                            }
                                                        })
                                                        .then(result => {
                                                            if (result != 0) {
                                                                return res.status(200).json({
                                                                    status: "true",
                                                                    message: "quantity updated"
                                                                });
                                                            }
                                                        })
                                                }
                                            } else {
                                                return res.status(400).json({
                                                    status: "false",
                                                    message: "no cart items found"
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
                                        message: "no cart found"
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
                            message: "Please provide complete data"
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



exports.removeProduct = (req, res) => {
    redis.authenticateToken(req.headers.authorization, (result) => {
        if (result == false) {
            const jwt_result = jwt.jwt_verify(req.headers.authorization);

            if (jwt_result && jwt_result != undefined) {
                new formidable.IncomingForm().parse(req, (err, fields, files) => {
                    if (err) {
                        console.error('Error', err)
                        throw err
                    }
                    const cart_id = fields["cart_id"];
                    const user_id = jwt_result;
                    const cart_item_id = fields["cart_item_id"];
                    if (cart_id && user_id && cart_item_id) {
                        Cart.findOne({
                                where: {
                                    id: cart_id,
                                    userId: user_id
                                }
                            })
                            .then(cart => {
                                if (cart) {
                                    Cart_item.findOne({
                                            where: {
                                                cartId: cart.id,
                                                id: cart_item_id
                                            }
                                        })
                                        .then(delete_item => {
                                            if (delete_item) {
                                                var promise = delete_item.destroy();
                                                if (promise) {
                                                    return res.status(200).json({
                                                        status: "true",
                                                        message: "item deleted from cart"
                                                    });
                                                } else {
                                                    return res.status(400).json({
                                                        status: "false",
                                                        message: "not able to delete item"
                                                    });
                                                }

                                            } else {
                                                return res.status(400).json({
                                                    status: "false",
                                                    message: "no item found"
                                                });
                                            }
                                        })
                                } else {
                                    return res.status(400).json({
                                        status: "false",
                                        message: "no cart found"
                                    });
                                }
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