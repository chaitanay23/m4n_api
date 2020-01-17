const formidable = require("formidable");
const Coupon = require("../../models/coupon");
const Order = require("../../models/order");
const Cart = require("../../models/cart");
const Cart_item = require("../../models/cart-item");
const jwt = require("../jwt");
const redis = require("../redis");

module.exports.coupon = function(req, res) {
  redis.authenticateToken(req.headers.authorization, result => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, (err, fields) => {
          if (err) {
            console.error("Error", err);
            throw err;
          }

          const user_id = jwt_result;
          const cart_id = fields["cart_id"];
          const coupon_id = fields["coupon_id"];

          Coupon.findOne({
            where: { id: coupon_id }
          }).then(coupon_detail => {
            Order.count({
              where: { couponId: coupon_detail.id }
            }).then(coupon_order => {
              if (!(coupon_detail.dayLimit >= coupon_order)) {
                return res.json({
                  discount: 0,
                  msg: "Day limit exceeded!"
                });
              } else {
                Order.count({
                  where: { couponId: coupon_detail.id, userId: user_id }
                })
                  .then(order_count => {
                    if (!(coupon_detail.userLimit >= order_count)) {
                      return res.json({
                        discount: 0,
                        msg: "Coupon limit exceeded!"
                      });
                    } else {
                      let type = coupon_detail.details.type;
                      let scope = coupon_detail.details.scope;
                      let buy, get, discount;
                      let final_discount = 0;
                      if (type == "offer") {
                        buy = coupon_detail.details.buy;
                        get = coupon_detail.details.get;
                      } else {
                        discount = coupon_detail.details.discount;
                      }
                      Cart.findOne({
                        where: { id: cart_id },
                        include: [
                          {
                            model: Cart_item,
                            attributes: ["price"]
                          }
                        ]
                      })
                        .then(cart => {
                          if (cart) {
                            if (type == "flat") {
                              if (scope == "cart") {
                                final_discount = discount;
                              } else {
                                final_discount = cart.totalPackage * discount;
                              }
                            } else if (type == "percentage") {
                              final_discount =
                                (cart.totalPrice * discount) / 100;
                            } else if (
                              type == "offer" &&
                              cart.totalPackage >= buy + get
                            ) {
                              cart.cartItems.sort(function(a, b) {
                                return a.price - b.price;
                              });
                              for (i = 0; i < get; i++) {
                                final_discount += cart.cartItems[i].price;
                              }
                            } else {
                              return res.json({
                                discount: 0,
                                msg: "Discount not available"
                              });
                            }
                            return res.json({
                              discount: final_discount,
                              msg: "Available discount"
                            });
                          }
                        })
                        .catch(err => {
                          return res.json({
                            status: "false",
                            error: err,
                            msg: "Failure"
                          });
                        });
                    }
                  })
                  .catch(err => {
                    return res.json({
                      status: "false",
                      error: err,
                      msg: "Failure"
                    });
                  });
              }
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
};
