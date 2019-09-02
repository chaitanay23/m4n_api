const express=require("express");
const sequel = require ('./config');
const Sequelize = require('sequelize');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const morgan = require('morgan');
var fs = require('fs');

// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

app.use(morgan(function (tokens, req, res) {
  return [
    "LOG:: [",
    tokens.date('web'),
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    "]"
  ].join(' ')
}, { stream: accessLogStream }));

app.use(cors());
// var port = process.env.ENV_PORT;

const bodyParser = require('body-parser');
const session = require('express-session');
const multer = require('multer');
// const SequelizeStore =  require('connect-session-sequelize')(session.Store);

//database config for session use only
// const sequelize = new Sequelize(
// 'candy-api',
// 'phpmyadmin',
// 'tepl@123',
// {
// dialect:'mysql',
// host:'localhost'
// });


const errorController = require('./controllers/error');
const user = require('./models/users');
const Product = require('./models/product');
const Aduser = require('./models/aduser');
const hand_image = require('./models/hand-image');
const finger_size = require('./models/finger-size');
const address = require('./models/address');
const design_image = require('./models/design-image');
const cart = require('./models/cart');
const cart_item = require('./models/cart-item');
const order = require('./models/order');
const store = require('./models/store');
const kioskUser = require('./models/kioskUser');
const discountCoupon = require('./models/discountCoupon');
const gstTax = require('./models/gsttax');
const videoLink = require('./models/video-link');
const wishlist = require('./models/wishlist');
const paymemt = require('./models/payment');
const factoryUser = require('./models/factory-user');
const customerCareUser = require('./models/customer-care');

app.set('view engine', 'ejs');
app.set('views', 'views');


const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const handRoutes = require('./routes/hand-image');
const fingerSize = require('./routes/finger-size');
const addressRoute = require('./routes/address');
const designRoute = require('./routes/design-image');
const cartRoute = require('./routes/cart');
const productRoute = require('./routes/product');
const orderRoute = require('./routes/order');
const jobRoute = require('./routes/job-card');
const kioskRoute = require('./routes/kiosk');
const CouponRoute = require('./routes/coupon');
const VideoRoute = require('./routes/video');
const WishlistRoute = require('./routes/wishlist');
const invoiceRoute = require('./routes/invoice');
const CustomerCareRoute = require('./routes/customer-care');

//route for app
app.use('/user',userRoutes);
app.use('/profile_pic',express.static('profile_pic'));
app.use('/hand',handRoutes);
app.use('/hand-uploads',express.static('hand-uploads'));
app.use('/hand_upload_merge',express.static('hand_upload_merge'));
app.use('/finger',fingerSize);
app.use('/address',addressRoute);
app.use('/design',designRoute);
app.use('/design-uploads',express.static('design-uploads'));
app.use('/cart',cartRoute);
app.use('/product',productRoute);
app.use('/order',orderRoute);
app.use('/job',jobRoute);
app.use('/kiosk',kioskRoute);
app.use('/coupon',CouponRoute);
app.use('/video',VideoRoute);
app.use('/wishlist',WishlistRoute);
app.use('/invoice',invoiceRoute);
app.use('/support',CustomerCareRoute);

//extranet use
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/images',express.static('images'));
app.use('/admin/images',express.static('images'));
app.use('/video_thumbnail',express.static('video_thumbnail'));
app.use(express.static(path.join(__dirname, 'public')));
// app.use(session({secret:'jacinthvarughese',resave:false,saveUninitialized:false,store: new SequelizeStore({
//   db:sequelize
// }),
// resave:false,
// proxy:true
// }));
app.use(session({secret:'jacinthvarughese',resave:false,saveUninitialized:false}));

app.use(cookieParser());

//extranet
app.use((req, res, next) => {
   Aduser.findByPk(1)
     .then(user => { 
       req.aduser = user;
       next();
     })
     .catch(err => console.log(err));
 });
    
app.use('/admin', adminRoutes);
app.use(authRoutes);
app.use(errorController.get404);

user.belongsTo(kioskUser);

cart.belongsTo(user);
cart.hasMany(cart_item);
Product.hasMany(cart_item);
cart_item.belongsTo(Product);
// cart.belongsToMany(Product, {through:cart_item});
// Product.belongsToMany(cart, {through:cart_item});

user.hasMany(order);
order.belongsTo(user);
order.belongsTo(address);
order.belongsTo(store);
order.belongsTo(cart);
order.belongsTo(hand_image,{as: 'handImage',foreignKey: 'handImageId'});
order.belongsTo(design_image,{as: 'designImage',foreignKey: 'designImageId'});
order.belongsTo(finger_size,{as: 'finger',foreignKey: 'fingerSizeId'});
order.belongsTo(kioskUser);
order.belongsTo(paymemt);
order.belongsTo(order);

wishlist.belongsTo(user);
wishlist.belongsTo(Product);

Product.belongsTo(Aduser, {
  constraints: true,
});
Aduser.hasMany(Product);

hand_image.belongsTo(user,{
  constraints:true,
});
user.hasOne(finger_size);
finger_size.belongsTo(user,{
  constraints:true
});
user.hasMany(address);
address.belongsTo(user, {
  constraints:true,
});
address.belongsTo(store);
design_image.belongsTo(user,{
  constraints:true,
});



sequel.sync().then(result =>{
  app.listen(3000);
}).catch(error=>{
  console.log(error);
});