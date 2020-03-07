const formidable = require("formidable");
const Store = require("../../models/store");
const jwt = require("../jwt");
const redis = require("../redis");
const coupon_calulation = require("../coupon_calculation");
const gst_calculation = require("../gst_calculation");
const delivery_charge = require("../delivery_charge");
const Address = require("../../models/address");
const Cart = require("../../models/cart");
const Finger = require("../../models/finger-size");
const Order = require("../../models/order");
const ref_gen = require("../reference-creator");
const Package = require("../../models/package");
const Cart_item = require("../../models/cart-item");

exports.readyOrder = (req, res) => {
  redis.authenticateToken(req.headers.authorization, result => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, async (err, fields, files) => {
          if (err) {
            console.error("Error", err);
            throw err;
          }

          const user_id = jwt_result;
          const cart_id = fields["cart_id"];
          const address_id = fields["address_id"];
          var coupon_id = fields["coupon_id"];
          let coupon_discount = 0;
          let net_payable = 0;
          let reference_id;
          var package_list = [];

          if (!(cart_id && address_id)) {
            return res.status(400).json({
              status: "false",
              message: "Provide cart and address details"
            });
          }
          // if (!(coupon_id && coupon_id.isInteger(2))) {
          //   coupon_id = null;
          // }
          Address.findOne({
            where: {
              id: address_id,
              userId: user_id
            },
            attributes: ["id", "zipcode"]
          })
            .then(address => {
              if (!address) {
                return res.status(400).json({
                  status: "false",
                  message: "No address found"
                });
              }
              Finger.findOne({
                where: {
                  userId: user_id
                },
                attributes: ["id"]
              })
                .then(finger_size => {
                  if (!finger_size) {
                    return res.status(400).json({
                      status: "false",
                      message: "Click images again no finger size found"
                    });
                  } else {
                    Cart.findOne({
                      where: {
                        id: cart_id,
                        status: 1
                      },
                      include: [
                        {
                          model: Cart_item,
                          attributes: ["price", "packageId"],
                          include: {
                            model: Package,
                            attributes: ["name"]
                          }
                        }
                      ],
                      attributes: ["id", "status", "totalPrice", "totalPackage"]
                    })
                      .then(resp => {
                        if (!resp) {
                          return res.json({
                            status: "false",
                            message: "No cart found"
                          });
                        } else {
                          const dtdc_charge = delivery_charge.deliveryCharge(
                            resp.totalPrice,
                            address.zipcode
                          );
                          for (i = 0; i < resp.cartItems.length; i++) {
                            package_list.push(resp.cartItems[i]["packageId"]);
                          }
                          gst_calculation.tax_amt(
                            resp.totalPrice,
                            package_gst => {
                              gst_calculation.tax_amt(
                                dtdc_charge,
                                delivery_gst => {
                                  net_payable = resp.totalPrice + dtdc_charge;
                                  coupon_calulation.discountCal(
                                    coupon_id,
                                    user_id,
                                    package_list,
                                    cart_id,
                                    response => {
                                      coupon_discount = response.discount;
                                      coupon_msg = response.msg;
                                      net_payable =
                                        resp.totalPrice +
                                        dtdc_charge -
                                        coupon_discount;
                                      ref_gen.reference(ref_id => {
                                        reference_id = ref_id;

                                        if (!coupon_id || coupon_id == "") {
                                          coupon_id = null;
                                        }
                                        Order.findOne({
                                          where: {
                                            userId: user_id,
                                            cartId: resp.id,
                                            addressId: address_id,
                                            internalStatus: "pending"
                                          }
                                        })
                                          .then(active_order => {
                                            if (!active_order) {
                                              Order.create({
                                                reference_id: reference_id,
                                                totalPrice: resp.totalPrice,
                                                totalQuantity:
                                                  resp.totalPackage,
                                                product_gst_tax: package_gst,
                                                delivery_gst_tax: delivery_gst,
                                                status: "Payment pending!",
                                                internalStatus: "pending",
                                                discountAmount: coupon_discount,
                                                netPayable: net_payable,
                                                delivery_charges: dtdc_charge,
                                                userId: user_id,
                                                addressId: address_id,
                                                cartId: resp.id,
                                                fingerSizeId: finger_size.id,
                                                couponId: coupon_id
                                              })
                                                .then(order_create => {
                                                  if (!order_create) {
                                                    return res
                                                      .status(400)
                                                      .json({
                                                        status: "false",
                                                        message:
                                                          "Unable to process order"
                                                      });
                                                  } else {
                                                    return res
                                                      .status(200)
                                                      .json({
                                                        status: "true",
                                                        message: "Order placed",
                                                        order_id:
                                                          order_create.id,
                                                        reference_id: reference_id,
                                                        net_payable: net_payable
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
                                            } else {
                                              Order.update(
                                                {
                                                  reference_id: reference_id,
                                                  totalPrice: resp.totalPrice,
                                                  totalQuantity:
                                                    resp.totalPackage,
                                                  product_gst_tax: package_gst,
                                                  delivery_gst_tax: delivery_gst,
                                                  status: "Payment pending!",
                                                  internalStatus: "pending",
                                                  discountAmount: coupon_discount,
                                                  netPayable: net_payable,
                                                  delivery_charges: dtdc_charge,
                                                  userId: user_id,
                                                  addressId: address_id,
                                                  cartId: resp.id,
                                                  fingerSizeId: finger_size.id,
                                                  couponId: coupon_id
                                                },
                                                {
                                                  where: {
                                                    id: active_order.id
                                                  }
                                                }
                                              )
                                                .then(order_update => {
                                                  if (order_update != 1) {
                                                    return res
                                                      .status(400)
                                                      .json({
                                                        status: "false",
                                                        message:
                                                          "Unable to process order"
                                                      });
                                                  } else {
                                                    return res
                                                      .status(200)
                                                      .json({
                                                        status: "true",
                                                        message: "Order placed",
                                                        order_id:
                                                          active_order.id,
                                                        reference_id: reference_id,
                                                        net_payable: net_payable
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
                                    }
                                  );
                                }
                              );
                            }
                          );
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
            })
            .catch(err => {
              return res.json({
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
};
