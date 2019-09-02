const formidable = require('formidable');
const Order = require('../../models/order');
const Address = require('../../models/address');
const Store = require('../../models/store');
const Product = require('../../models/product');
const Cart = require('../../models/cart');
const Cart_item = require('../../models/cart-item');
const jwt = require('../jwt');
const redis = require('../redis');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

exports.process_reorder = (req, res) => {
    redis.authenticateToken(req.headers.authorization, (result) => {
        if (result == false) {

            const jwt_result = jwt.jwt_verify(req.headers.authorization);

            if (jwt_result && jwt_result != undefined) {
                new formidable.IncomingForm().parse(req, async (err, fields, files) => {
                    if (err) {
                        return res.status(500).json({
                            status: "false",
                            message: "Error",
                            error: err
                        });
                    }

                    const user_id = fields["user_id"];
                    const order_id = fields["order_id"];
                    var lf1 = fields['L1'];
                    var lf2 = fields['L2'];
                    var lf3 = fields['L3'];
                    var lf4 = fields['L4']; //1st finger index finger
                    var lf5 = fields['LT']; //thumb left
                    var rf1 = fields['R1'];
                    var rf2 = fields['R2'];
                    var rf3 = fields['R3'];
                    var rf4 = fields['R4']; //last finger
                    var rf5 = fields['RT']; //thumb right
                    var product_attribute = ['id', 'title', 'product_code', 'product_type', 'imageUrl', 'fav', 'description'];
                    var data = [lf1,lf2,lf3,lf4,lf5,rf1,rf2,rf3,rf4,rf5];
                    var fingers = data.filter(ele=>{
                        return ele !== undefined
                    });
                    let new_cart = null;
                    
                    if(!user_id && !order_id)
                    {
                        return res.status(400).json({
                            status:"false",
                            message:"Please provide user id and order id"
                        });
                    }
                    Order.findOne({
                            where: {
                                id: order_id,
                                userId: user_id,
                                orderId:{[Op.eq]:null}
                            }
                        })
                        .then(check_order => {
                            if (!check_order) {
                                return res.status(400).json({
                                    status: "false",
                                    message: "Re-order not applicable"
                                });
                            } else {
                                Order.findAndCountAll({
                                        where: {
                                            orderId: check_order.id
                                        }
                                    })
                                    .then(already_reorder => {
                                        if (already_reorder.count > 0) {
                                            return res.status(400).json({
                                                status: "false",
                                                message: "Re-order already taken for this order"
                                            });
                                        } else {
                                            if (check_order.totalPrice <= 0) {
                                                return res.status(400).json({
                                                    status: "false",
                                                    message: "Re-order for this order is not possible"
                                                });
                                            } else {
                                                Order.findOne({
                                                    where:{id:check_order.id},
                                                    include:[
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
                                                .then(async order_detail =>{
                                                    await Cart.create({
                                                        userId:user_id,
                                                        status:0
                                                    })
                                                    .then(reorder_cart=>{
                                                        if(!reorder_cart)
                                                        {
                                                            return res.status(400).json({
                                                                status:"false",
                                                                message:"Failed to create cart"
                                                            });
                                                        }
                                                        else{
                                                            new_cart = reorder_cart.id;
                                                            order_detail.cart.cartItems.forEach(item => {
                                                                if(!item)
                                                                {
                                                                    return res.status(204).json({
                                                                        status:"false",
                                                                        message:"No items found"
                                                                    });
                                                                }
                                                                else{
                                                                    fingers.forEach(finger => {
                                                                        Cart_item.create({
                                                                            quantity:item.quantity,
                                                                            finger_id:finger,
                                                                            price:0,
                                                                            cartId:reorder_cart.id,
                                                                            productId:item.productId
                                                                        })
                                                                        .then(reorder_cart_item =>{
                                                                            if(!reorder_cart_item)
                                                                            {
                                                                                return res.status(400).json({
                                                                                    status:"false",
                                                                                    message:"Failed to create cart items"
                                                                                });
                                                                            }
                                                                        })
                                                                        .catch(err => {
                                                                            return res.status(400).json({
                                                                                status: "false",
                                                                                error: err,
                                                                                message: "Failure1"
                                                                            });
                                                                        });
                                                                    });
                                                                }
                                                            });
                                                        }
                                                    })
                                                    .catch(err => {
                                                        return res.status(400).json({
                                                            status: "false",
                                                            error: err,
                                                            message: "Failure2"
                                                        });
                                                    });
                                                    console.table([new_cart]);
                                                    await Order.create({
                                                        totalPrice:0,
                                                        totalQuantity:order_detail.totalQuantity,
                                                        product_gst_tax:0,
                                                        delivery_gst_tax:0,
                                                        status:"Re-order placed",
                                                        internalStatus:"reorder",
                                                        discountAmount:0,
                                                        netPayable:0,
                                                        delivery_charges:0,
                                                        delivery_discount:0,
                                                        userId:order_detail.userId,
                                                        addressId:order_detail.addressId,
                                                        storeId:order_detail.storeId,
                                                        cartId:new_cart,
                                                        handImageId:order_detail.handImageId,
                                                        designImageId:order_detail.designImageId,
                                                        fingerSizeId:order_detail.fingerSizeId,
                                                        kioskUserId:order_detail.kioskUserId,
                                                        paymentId:order_detail.paymentId,
                                                        orderId:order_id
                                                    })
                                                    .then(re_order=>{
                                                        if(!re_order)
                                                        {
                                                            return res.status(500).json({
                                                                status:"false",
                                                                message:"Failed to process re_order"
                                                            });
                                                        }
                                                        else{
                                                            return res.status(200).json({
                                                                status:"true",
                                                                message:"order placed",
                                                                order_id:re_order.id
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
                                                })
                                                .catch(err => {
                                                    return res.status(400).json({
                                                        status: "false",
                                                        error: err,
                                                        message: "Failure"
                                                    });
                                                });
                                            }
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