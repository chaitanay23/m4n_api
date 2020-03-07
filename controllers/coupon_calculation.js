const Coupon = require("../models/coupon");
const Order = require("../models/order");
const Cart = require("../models/cart");
const Cart_item = require("../models/cart-item");
const Op = require("sequelize").Op;
const Package = require("../models/package");
const Coupon_package = require("../models/couponPackage");

exports.discountCal = (coupon_id, user_id, package_list, cart_id, callback) => {
  if (!coupon_id) {
    return callback({
      discount: 0,
      msg: "No coupon found!"
    });
  }
  Coupon.findOne({
    where: {
      [Op.or]: [
        {
          id: coupon_id
        },
        {
          name: {
            [Op.like]: coupon_id
          }
        }
      ],
      flag: 1
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
  }).then(coupon_detail => {
    if (!coupon_detail) {
      return callback({
        discount: 0,
        msg: "No coupon found!"
      });
    }
    var date = new Date();
    current_date =
      date.getFullYear() +
      "-" +
      ("0" + (date.getMonth() + 1)).slice(-2) +
      "-" +
      ("0" + date.getDate()).slice(-2);
    var start_date = current_date + "T00:00:00.000Z";
    var end_date = current_date + "T23:59:59.000Z";

    Order.count({
      where: {
        couponId: coupon_detail.id,
        createdAt: {
          [Op.between]: [start_date, end_date]
        },
        internalStatus: {
          [Op.notIn]: ["pending", "failed"]
        }
      }
    }).then(coupon_order => {
      if (!(coupon_detail.dayLimit >= coupon_order)) {
        callback({
          discount: 0,
          msg: "Day limit exceeded!"
        });
      } else {
        Order.count({
          where: {
            couponId: coupon_detail.id,
            userId: user_id,
            internalStatus: {
              [Op.notIn]: ["pending", "failed"]
            }
          }
        })
          .then(order_count => {
            if (!(coupon_detail.userLimit >= order_count)) {
              callback({
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
                where: {
                  id: cart_id
                },
                include: [
                  {
                    model: Cart_item,
                    attributes: ["price"]
                  }
                ]
              })
                .then(cart => {
                  if (cart) {
                    if (type == "flat" && discount <= cart.totalPrice) {
                      if (scope == "cart") {
                        final_discount = discount;
                      } else {
                        final_discount = cart.totalPackage * discount;
                      }
                    } else if (type == "percentage") {
                      final_discount = (cart.totalPrice * discount) / 100;
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
                    } else if (type == "flat") {
                      final_discount = discount;
                    } else {
                      final_discount = 0;
                    }
                    if (final_discount == 0) {
                      callback({
                        discount: 0,
                        msg: "Discount not available"
                      });
                    } else {
                      callback({
                        discount: final_discount,
                        msg: "Available discount"
                      });
                    }
                  }
                })
                .catch(err => {
                  callback({
                    status: "false",
                    error: err,
                    msg: "Failure"
                  });
                });
            }
          })
          .catch(err => {
            callback({
              status: "false",
              error: err,
              msg: "Failure"
            });
          });
      }
    });
  });
};
