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
const Op = Sequelize.Op

exports.orderDetail = (req, res) => {
    redis.authenticateToken(req.headers.authorization, (result) => {
        if (result == false) {

            const jwt_result = jwt.jwt_verify(req.headers.authorization);

            if (jwt_result && jwt_result != undefined) {
                new formidable.IncomingForm().parse(req, async (err, fields, files) => {
                    if (err) {
                        return res.status(500).json({
                            status:"false",
                            message:"Error",
                            error:err
                        });
                    }
                    const user_id = jwt_result;
                    const order_id = fields["order_id"];
                    var product_attribute = ['id', 'title', 'product_code', 'product_type', 'imageUrl', 'fav', 'description'];
                    

                    Order.findOne({where:{id:order_id},
                        include:[
                            {
                                model:Address,
                                attributes: ['id', 'name', 'type', 'mobile', 'state', 'city', 'area', 'address', 'zipcode']
                            },
                            {
                                model:Store,
                                attributes: ['id', ['owner_name', 'name'],
                                ['store_name', 'type'], 'mobile', 'state', 'city', 'area', 'address', 'zipcode']
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
                        ],
                        attributes:['id','totalPrice','totalQuantity','status','coupon','discountAmount','netPayable','delivery_charges','delivery_discount','product_gst_tax','delivery_gst_tax','addressId','storeId','cartId']
                    })
                    .then(orders =>{
                        return res.status(200).json({
                            status:"true",
                            message:"User order detail",
                            order:orders
                        });
                    })
                    .catch(err=>{
                        return res.status(400).json({status:"false",error:err,message:"Failure"});
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