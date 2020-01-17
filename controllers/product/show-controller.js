// const formidable = require('formidable');
// const Product = require('../../models/product');
// const jwt = require('../jwt');
// const redis = require('../redis');
// const Order = require('../../models/order');
// const Cart_item = require('../../models/cart-item');
// const Wishlist = require('../../models/wishlist');
// const Sequelize = require('sequelize');
// const Op = Sequelize.Op;

// exports.getProductype = (req, res) => {
//     redis.authenticateToken(req.headers.authorization, (result) => {
//         if (result == false) {
//             const jwt_result = jwt.jwt_verify(req.headers.authorization);

//             if (jwt_result && jwt_result != undefined) {
//                 new formidable.IncomingForm().parse(req, async (err, fields, files) => {
//                     if (err) {
//                         console.error('Error', err)
//                         throw err
//                     }
//                     const product_type = fields["product_type"];
//                     const user_id = jwt_result;
//                     let wish = [];

//                     await Wishlist.findAll({
//                             attributes: ['productId'],
//                             where: {
//                                 userId: user_id
//                             }
//                         })
//                         .then(wishlist_product => {
//                             wishlist_product.forEach(wish_product => {
//                                 wish.push(wish_product.productId);
//                             });
//                         });

//                     if (product_type == 'free_nail') {
//                         Product.findAll({
//                                 where: {
//                                     product_type: product_type
//                                 }
//                             })
//                             .then(free_product => {
//                                 if (free_product.length > 0) {
//                                     free_product.forEach(product => {
//                                         if (wish.includes(product.id)) {
//                                             product.fav = 1;
//                                         } else {
//                                             product.fav = product.fav;
//                                         }
//                                         Order.findAll({
//                                                 where: {
//                                                     userId: user_id,
//                                                     payment_comment: {
//                                                         [Op.eq]: null
//                                                     }
//                                                 }
//                                             })
//                                             .then(user_order => {
//                                                 if (user_order.length > 0) {
//                                                     user_order.forEach(order => {
//                                                         Cart_item.findAndCountAll({
//                                                                 where: [{
//                                                                     cartId: order.cartId
//                                                                 }, {
//                                                                     productId: product.id
//                                                                 }]
//                                                             })
//                                                             .then(product_count => {
//                                                                 if (product_count.count > 0) {
//                                                                     //need to be change cannnot set headers error
//                                                                     return res.status(400).end(JSON.stringify({
//                                                                         status: "false",
//                                                                         message: "You already avail for free product"
//                                                                     }));
//                                                                 } else {
//                                                                     return res.status(200).end(JSON.stringify({
//                                                                         status: "true",
//                                                                         message: 'List of products',
//                                                                         products: free_product
//                                                                     }));
//                                                                 }
//                                                             })
//                                                             .catch(err => {
//                                                                 return res.status(400).json({
//                                                                     status: "false",
//                                                                     error: err,
//                                                                     message: "Failure"
//                                                                 });
//                                                             });

//                                                     });
//                                                 } else {
//                                                     return res.status(200).json({
//                                                         status: "true",
//                                                         message: 'List of products',
//                                                         products: free_product
//                                                     });
//                                                 }
//                                             })
//                                             .catch(err => {
//                                                 return res.status(400).json({
//                                                     status: "false",
//                                                     error: err,
//                                                     message: "Failure"
//                                                 });
//                                             });
//                                     });
//                                 }
//                             })
//                     } else {
//                         Product.findAll({
//                                 where: {
//                                     product_type: product_type
//                                 }
//                             })
//                             .then(prods => {
//                                 if (prods.length > 0) {
//                                     prods.forEach(list => {
//                                         if (wish.includes(list.id)) {
//                                             list.fav = 1;
//                                         } else {
//                                             list.fav = list.fav;
//                                         }
//                                     });
//                                     return res.status(200).json({
//                                         status: "true",
//                                         message: 'List of products',
//                                         products: prods
//                                     });

//                                 } else {
//                                     return res.status(400).json({
//                                         status: "false",
//                                         message: 'No products found'
//                                     });
//                                 }
//                             })
//                             .catch(err => {
//                                 return res.status(400).json({
//                                     status: "false",
//                                     error: err,
//                                     message: "Failure"
//                                 });
//                             });
//                     }
//                 });
//             } else {
//                 return res.status(400).json({
//                     status: "false",
//                     message: "Token not verified"
//                 });
//             }
//         } else {
//             return res.status(400).json({
//                 status: "false",
//                 message: "User not Logged In"
//             });
//         }
//     });
// }
