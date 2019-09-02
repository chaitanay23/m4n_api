const formidable = require('formidable');
const Cart = require('../../models/cart');
const Cart_item = require('../../models/cart-item');
const Product = require('../../models/product');
const Sequelize = require('sequelize');
const Op = Sequelize.Op
const jwt = require('../jwt');
const redis = require('../redis');

exports.showCart = (req, res) => {
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
                    var product_attribute = ['id','title','product_code','product_type','imageUrl','fav','description'];
                    await Cart.findOne({
                            where: {
                                userId: user_id,
                                status: "1"
                            }
                        })
                        .then(cart => {
                            if (cart) {
                                Cart_item.findAll({
                                        where: {
                                            cartId: cart.id,
                                            quantity: {
                                                [Op.gt]: 0
                                            }
                                        },
                                        attributes:['id','quantity','finger_id','hand_id','price'],
                                        include:[
                                            {model:Product,attributes:product_attribute}
                                        ]
                                    })
                                    .then(cart_item => {
                                        if (cart_item.length > 0) {
                                            return res.status(200).json({
                                                status: "true",
                                                message: "Cart list",
                                                cart_id: cart.id,
                                                items: cart_item
                                            });
                                        } else {
                                            return res.status(400).json({
                                                status: "false",
                                                message: "No item found in cart"
                                            });
                                        }
                                    })
                                    .catch(err => {
                                        return res.status(400).json({
                                            status: "false",
                                            error: err
                                        });
                                    });
                            } else {
                                return res.status(400).json({
                                    status: "false",
                                    message: "No product in cart found"
                                });
                            }
                        })
                        .catch(err => {
                            return res.status(400).json({
                                status: "false",
                                error: err
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