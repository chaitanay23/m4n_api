const express = require("express");
const sequel = require("./config");
const Sequelize = require("sequelize");
const app = express();
const path = require("path");
// const passport = require('passport');
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");
var fs = require("fs");

// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), {
  flags: "a"
});

app.use(
  morgan(
    function(tokens, req, res) {
      return [
        "LOG:: [",
        tokens.date("web"),
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, "content-length"),
        "-",
        tokens["response-time"](req, res),
        "ms",
        "]"
      ].join(" ");
    },
    {
      stream: accessLogStream
    }
  )
);

app.use(cors());
// var port = process.env.ENV_PORT;

// app.use(passport.initialize());
//passport iitial

const bodyParser = require("body-parser");
const session = require("express-session");

const errorController = require("./controllers/error");
const user = require("./models/users");
// const Product = require("./models/product");
const ListItem = require("./models/list_item");
const Aduser = require("./models/aduser");
const addCharge = require("./models/address-charge");
const hand_image = require("./models/hand-image");
const finger_size = require("./models/finger-size");
const address = require("./models/address");
const design_image = require("./models/design-image");
const cart = require("./models/cart");
const cart_item = require("./models/cart-item");
const order = require("./models/order");
const store = require("./models/store");
const kioskUser = require("./models/kioskUser");
const coupon = require("./models/coupon");
const homePage = require("./models/homepage");
const screenId = require("./models/screen_id");
const version = require("./models/version");
const gstTax = require("./models/gsttax");
const videoLink = require("./models/video-link");
const wishlist = require("./models/wishlist");
const paymemt = require("./models/payment");
const factoryUser = require("./models/factory-user");
const customerCareUser = require("./models/customer-care");
const awbNumber = require("./models/awb_number");
const package = require("./models/package");
const preset = require("./models/preset");
const accessories = require("./models/accessories");
const couponPackage = require("./models/couponPackage");

/* Models Import and Association for Partner Portal */
const state = require("./models/state");
const pincode = require("./models/pincode");
const partner = require("./models/partner");
const sale = require("./models/sale");
const commission = require("./models/partner_commission");

partner.hasMany(commission);
package.hasMany(commission);

package.belongsToMany(coupon, {
  through: couponPackage
});
coupon.belongsToMany(package, {
  through: couponPackage
});

order.hasMany(sale);
partner.hasMany(sale);

state.hasMany(pincode);
partner.hasMany(pincode);

const partnerRoutes = require("./routes/partner");
app.use("/partner", partnerRoutes);
/* Partner Portal Config End */

app.set("view engine", "ejs");
app.set("views", "views");

/* only for candy apps  */
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const handRoutes = require("./routes/hand-image");
const fingerSize = require("./routes/finger-size");
const addressRoute = require("./routes/address");
const designRoute = require("./routes/design-image");
const cartRoute = require("./routes/cart");
const productRoute = require("./routes/product");
const orderRoute = require("./routes/order");
const jobRoute = require("./routes/job-card");
const kioskRoute = require("./routes/kiosk");
const homePageRoute = require("./routes/homepage");
const versionRoute = require("./routes/version");

/* Only for candy ext */
const candyextListItemRoute = require("./routes-ext/listItem");
const candyextadmin_user = require("./routes-ext/adminUser");
const candyextPackage = require("./routes-ext/package");
const candyPreset = require("./routes-ext/preset");
const candyOrder = require("./routes-ext/order");

//route to handle login and registration  onboarding
const CouponRoute = require("./routes/coupon");
const VideoRoute = require("./routes/video");
const WishlistRoute = require("./routes/wishlist");
const invoiceRoute = require("./routes/invoice");
const track_order = require("./routes/track");
const delhivery = require("./routes/logistics_delhivery");
const CustomerCareRoute = require("./routes/customer-care");
const packageRoute = require("./routes/package");
const presetRoute = require("./routes/preset");

//route for app
app.use("/user", userRoutes);
app.use("/profile_pic", express.static("profile_pic"));
app.use("/hand", handRoutes);
app.use("/hand-uploads", express.static("hand-uploads"));
app.use("/hand_upload_merge", express.static("hand_upload_merge"));
app.use("/finger", fingerSize);
app.use("/address", addressRoute);
app.use("/design", designRoute);
app.use("/design-uploads", express.static("design-uploads"));
app.use("/cart", cartRoute);
app.use("/product", productRoute);
app.use("/order", orderRoute);
app.use("/job", jobRoute);
app.use("/kiosk", kioskRoute);
app.use("/coupon", CouponRoute);
app.use("/video", VideoRoute);
app.use("/wishlist", WishlistRoute);
app.use("/invoice", invoiceRoute);
app.use("/support", CustomerCareRoute);
app.use("/track", track_order);
app.use("/logistic", delhivery);
app.use("/package", packageRoute);
app.use("/preset", presetRoute);
app.use("/version", versionRoute);
app.use("/homePage", homePageRoute, express.static("homepage"));

/*For Extranet */
app.use("/ext/listitem", candyextListItemRoute, express.static("images"));
app.use("/ext/admin_user", candyextadmin_user);
app.use("/ext/package", candyextPackage);
app.use("/ext/preset", candyPreset);
app.use("/ext/order", candyOrder);

//extranet use
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use("/images", express.static("images"));
app.use("/packageImages", express.static("packageImages"));
app.use("/preset_images", express.static("preset_images"));
app.use("/dtdc_csv", express.static("dtdc_csv"));
app.use("/admin/images", express.static("images"));
app.use("/video_thumbnail", express.static("video_thumbnail"));
app.use(express.static(path.join(__dirname, "public")));
// app.use(session({secret:'jacinthvarughese',resave:false,saveUninitialized:false,store: new SequelizeStore({
//   db:sequelize
// }),
// resave:false,
// proxy:true
// }));
app.use(
  session({
    secret: "jacinthvarughese",
    resave: false,
    saveUninitialized: false
  })
);

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

app.use("/admin", adminRoutes);
app.use(authRoutes);
app.use(errorController.get404);

user.belongsTo(kioskUser);

cart.belongsTo(user);
cart.hasMany(cart_item);
package.hasMany(cart_item);
cart_item.belongsTo(package);
accessories.hasMany(cart_item);
cart_item.belongsTo(accessories);
// cart.belongsToMany(Product, {through:cart_item});
// Product.belongsToMany(cart, {through:cart_item});
package.hasMany(preset);
preset.belongsTo(package);
user.hasMany(order);
order.belongsTo(user);
order.belongsTo(address);
order.belongsTo(store);
order.belongsTo(cart);
order.belongsTo(finger_size, {
  as: "finger",
  foreignKey: "fingerSizeId"
});
order.belongsTo(kioskUser);
order.belongsTo(paymemt);
order.belongsTo(order);
order.belongsTo(coupon);

wishlist.belongsTo(user);
// wishlist.belongsTo(Product);

// Product.belongsTo(Aduser, {
//   constraints: true
// });
// Aduser.hasMany(Product);

hand_image.belongsTo(user, {
  constraints: true
});
user.hasOne(finger_size, {
  as: "finger",
  foreignKey: "userId"
});
finger_size.belongsTo(user, {
  constraints: true
});
user.hasMany(address);
address.belongsTo(user, {
  constraints: true
});

design_image.belongsTo(user, {
  constraints: true
});
design_image.belongsTo(cart_item);
cart_item.hasMany(design_image, {
  as: "design",
  foreignKey: "cartItemId"
});

homePage.belongsTo(screenId);

sequel
  .sync()
  .then(result => {
    app.listen(3000);
  })
  .catch(error => {
    console.log(error);
  });
