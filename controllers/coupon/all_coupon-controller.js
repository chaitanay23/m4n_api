const formidable = require("formidable");
const Coupon = require("../../models/coupon");
const jwt = require("../jwt");
const redis = require("../redis");
const Package = require("../../models/package");
const Coupon_package = require("../../models/couponPackage");
const Cart = require("../../models/cart");
const Cart_item = require("../../models/cart-item");
const Op = require("sequelize").Op;

module.exports.all_coupon = function(req, res) {
  redis.authenticateToken(req.headers.authorization, result => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, (err, fields) => {
          if (err) {
            console.error("Error", err);
            throw err;
          }

          const cart_id = fields["cart_id"];
          var package_list = [];

          if (!cart_id) {
            return res.json({
              status: "false",
              message: "No cart details found!"
            });
          } else {
            Cart.findOne({
              where: {
                id: cart_id
              },
              include: [
                {
                  model: Cart_item,
                  attributes: ["packageId"]
                }
              ]
            }).then(cart_package => {
              if (!cart_package) {
                return res.json({
                  status: "false",
                  message: "No package in cart"
                });
              } else {
                for (i = 0; i < cart_package.cartItems.length; i++) {
                  package_list.push(cart_package.cartItems[i]["packageId"]);
                }
                if (package_list.length > 0) {
                  Coupon.findAll({
                    where: {
                      flag: 1,
                      visible: 1
                    },
                    include: [
                      {
                        model: Package,
                        required: true,
                        attributes: ["id"],
                        through: {
                          model: Coupon_package,
                          where: {
                            packageId: {
                              [Op.in]: package_list
                            }
                          },
                          attributes: ["id"]
                        }
                      }
                    ]
                  })
                    .then(coupon => {
                      if (coupon.length != 0) {
                        return res.status(200).json({
                          status: "true",
                          message: "List of coupons",
                          coupon_list: coupon
                        });
                      } else {
                        return res.status(400).json({
                          status: "false",
                          message: "No coupon found"
                        });
                      }
                    })
                    .catch(err => {
                      return res.status(400).json({
                        status: "false",
                        error: err
                      });
                    });
                }
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
};
