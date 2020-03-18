const formidable = require("formidable");
const Order = require("../../models/order");
const Cart = require("../../models/cart");
const Cart_item = require("../../models/cart-item");
const jwt = require("../jwt");
const redis = require("../redis");
const sequelize = require("sequelize");
const Awb = require("../../models/awb_number");
const ENV = require("../../env");
const prefix = ENV.PREFIX;
const ref_gen = require("../reference-creator");
const Design = require("../../models/design-image");
const delhivery = require("../../delhivery/assign_wayBill");
const axios = require("axios");

exports.process_reorder = (req, res) => {
  redis.authenticateToken(req.headers.authorization, result => {
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
          const cart_item_id = fields["cart_item_id"];
          const order_id = fields["order_id"];
          const reference_id = fields["reference_id"];
          const package_id = fields["package_id"];
          let [lf1, lf2, lf3, lf4, lf5, rf1, rf2, rf3, rf4, rf5] = [
            fields["lf1"],
            fields["lf2"],
            fields["lf3"],
            fields["lf4"],
            fields["lf5"],
            fields["rf1"],
            fields["rf2"],
            fields["rf3"],
            fields["rf4"],
            fields["rf5"]
          ];
          if (!user_id && !cart_item_id) {
            return res.status(400).json({
              status: "false",
              message: "Please provide complete data"
            });
          }
          lf1 != null ? (lf1 = lf1.split(",").map(Number)) : (lf1 = [null]);
          lf2 != null ? (lf2 = lf2.split(",").map(Number)) : (lf2 = [null]);
          lf3 != null ? (lf3 = lf3.split(",").map(Number)) : (lf3 = [null]);
          lf4 != null ? (lf4 = lf4.split(",").map(Number)) : (lf4 = [null]);
          lf5 != null ? (lf5 = lf5.split(",").map(Number)) : (lf5 = [null]);
          rf1 != null ? (rf1 = rf1.split(",").map(Number)) : (rf1 = [null]);
          rf2 != null ? (rf2 = rf2.split(",").map(Number)) : (rf2 = [null]);
          rf3 != null ? (rf3 = rf3.split(",").map(Number)) : (rf3 = [null]);
          rf4 != null ? (rf4 = rf4.split(",").map(Number)) : (rf4 = [null]);
          rf5 != null ? (rf5 = rf5.split(",").map(Number)) : (rf5 = [null]);

          let totalItems = [
            ...lf1,
            ...lf2,
            ...lf3,
            ...lf4,
            ...lf5,
            ...rf1,
            ...rf2,
            ...rf3,
            ...rf4,
            ...rf5
          ].filter(num => num != null);

          Order.findOne({
            where: {
              id: order_id,
              reference_id
            }
          })
            .then(order => {
              if (order.reorder == "no") {
                if (
                  (lf1 ||
                    lf2 ||
                    lf3 ||
                    lf4 ||
                    lf5 ||
                    rf1 ||
                    rf2 ||
                    rf3 ||
                    rf4 ||
                    rf5) != null
                ) {
                  Cart.create({
                    status: 0,
                    totalPrice: 0,
                    totalPackage: 1,
                    totalItems: totalItems.length,
                    userId: user_id
                  })
                    .then(cart => {
                      Cart_item.create({
                        lf1,
                        lf2,
                        lf3,
                        lf4,
                        lf5,
                        rf1,
                        rf2,
                        rf3,
                        rf4,
                        rf5,
                        price: 0,
                        cartId: cart.id,
                        packageId: package_id
                      })
                        .then(cart_item => {
                          Design.findOne({
                            where: { cartItemId: cart_item_id }
                          })
                            .then(design_image => {
                              if (design_image) {
                                Design.create({
                                  lf1: design_image.lf1,
                                  lf2: design_image.lf2,
                                  lf3: design_image.lf3,
                                  lf4: design_image.lf4,
                                  lf5: design_image.lf5,
                                  rf1: design_image.rf1,
                                  rf2: design_image.rf2,
                                  rf3: design_image.rf3,
                                  rf4: design_image.rf4,
                                  rf5: design_image.rf5,
                                  userId: user_id,
                                  cartItemId: cart_item.id
                                }).catch(err => {
                                  res.json({
                                    status: "false",
                                    err,
                                    message: "Failed"
                                  });
                                });
                              }

                              ref_gen.reference(ref_id => {
                                let reference_id = ref_id;

                                axios
                                .get(ENV.LOGISTICS_DELHIVERY_GENERATE_WAYBILL)
                                  .then(awb_number => {
                                    Order.create({
                                      reference_id,
                                      totalPrice: 0,
                                      totalQuantity: 1,
                                      product_gst_tax: 0,
                                      delivery_gst_tax: 0,
                                      status: "Re-order placed",
                                      internalStatus: "reorder",
                                      discountAmount: 0,
                                      netPayable: 0,
                                      delivery_charges: 0,
                                      awb_number: awb_number.data,
                                      userId: user_id,
                                      addressId: order.addressId,
                                      cartId: cart.id,
                                      fingerSizeId: order.fingerSizeId,
                                      paymentId:order.paymentId,
                                      orderId: order_id
                                    })
                                      .then(new_reorder => {
                                        Order.update(
                                          {
                                            reorder: "yes"
                                          },
                                          {
                                            where: {
                                              id: order_id
                                            }
                                          }
                                        )
                                          .then(success =>
                                            res.json({
                                              status: "true",
                                              message: "Re-order placed",
                                              order_details: new_reorder
                                            })
                                          )
                                          .catch(err =>
                                            res.json({
                                              status: "false",
                                              err,
                                              message:
                                                "Order could not be updated"
                                            })
                                          );
                                      })
                                      .catch(err => {
                                        res.json({
                                          status: "false",
                                          err,
                                          message: "Order failed"
                                        });
                                      });
                                  })
                                  .catch(err => {
                                    res.json({
                                      status: "false",
                                      err,
                                      message: "AWB not generated"
                                    });
                                  });
                              });
                            })
                            .catch(err => {
                              res.json({
                                status: "false",
                                err,
                                message: "Failed"
                              });
                            });
                        })
                        .catch(err => {
                          res.json({
                            status: "false",
                            err,
                            message: "Items could not be added"
                          });
                        });
                    })
                    .catch(err => {
                      res.json({
                        status: "false",
                        err,
                        message: "Cart couldn't be created"
                      });
                    });
                } else {
                  res.json({
                    status: "false",
                    message: "Provide finger details"
                  });
                }
              } else {
                res.json({
                  status: "false",
                  message: "Reorder already done earlier"
                });
              }
            })
            .catch(err =>
              res.json({
                status: "false",
                err,
                message: "Invalid Order"
              })
            );
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
