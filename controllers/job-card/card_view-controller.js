const formidable = require('formidable');
const Order = require('../../models/order');
const Address = require('../../models/address');
const Design = require('../../models/design-image');
const User = require('../../models/users');
const Product = require('../../models/product');
const Hand = require('../../models/hand-image');
const Finger = require('../../models/finger-size');
const Cart = require('../../models/cart');
const Cart_item = require('../../models/cart-item');
const Store = require('../../models/store');
const jwt = require('../jwt');
const redis = require('../redis');

var url = process.env.ENV_baseURL;

exports.showJob = (req, res) => {
    redis.authenticateToken(req.headers.authorization, (result) => {
        if (result == false) {
            const jwt_result = jwt.jwt_verify(req.headers.authorization);

            if (jwt_result && jwt_result != undefined) {
                new formidable.IncomingForm().parse(req, (err, fields) => {
                    if (err) {
                        console.error('Error', err)
                        throw err
                    }

                    var order_id = fields["order_id"];
                    var product_attribute = ['id', 'title', 'product_code', 'product_type', 'imageUrl', 'fav', 'description'];

                    Order.findOne({
                            where: {
                                id: order_id
                            },
                            include: [{
                                    model: Address
                                },
                                {
                                    model: Store
                                },
                                {
                                    model: User
                                },
                                {
                                    model: Finger,as:'finger'
                                },
                                {
                                    model: Design,as:'designImage'
                                },
                                {
                                    model: Cart,
                                    include: [{
                                        model: Cart_item,
                                        include: [{
                                            model: Product,
                                            attributes: product_attribute
                                        }]
                                    }]
                                }
                            ]
                        })
                        .then(order => {
                            if (!order) {
                                return res.status(400).json({
                                    status: "false",
                                    message: "Provide valid order id"
                                });
                            } else {
                                return res.status(200).json({
                                    status: "true",
                                    message: "Job card ready",
                                    job_card: order
                                })
                            }
                        })
                })
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