const formidable = require("formidable");
const Order = require("../../models/order");
const Cart = require("../../models/cart");
const Cart_item = require("../../models/cart-item");
const jwt = require("../jwt");
const redis = require("../redis");
const sequelize = require("sequelize");
const delhivery = require("../../delhivery/assign_wayBill");
const Awb = require("../../models/awb_number");
const ENV = require("../../env");
const prefix = ENV.PREFIX;
const ref_gen = require("../reference-creator");
const Design = require("../../models/design-image");
const axios = require("axios");

exports.full_reorder = (req, res) => {
  redis.authenticateToken(req.headers.authorization, result => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, (err, fields, files) => {
          if (err) {
            return res.status(500).json({
              status: "false",
              message: "Error",
              error: err
            });
          }

          const user_id = fields["user_id"];
          const order_id = fields["order_id"];
          const reference_id = fields["reference_id"];
          let new_lf1,
            new_lf2,
            new_lf3,
            new_lf4,
            new_lf5,
            new_rf1,
            new_rf2,
            new_rf3,
            new_rf4,
            new_rf5;
          var lf1 = fields["L1"];
          var lf2 = fields["L2"];
          var lf3 = fields["L3"];
          var lf4 = fields["L4"]; //1st finger index finger
          var lf5 = fields["LT"]; //thumb left
          var rf1 = fields["R1"];
          var rf2 = fields["R2"];
          var rf3 = fields["R3"];
          var rf4 = fields["R4"]; //last finger
          var rf5 = fields["RT"]; //thumb right
          var data = [lf1, lf2, lf3, lf4, lf5, rf1, rf2, rf3, rf4, rf5];
          let fingers = data.filter(ele => {
            if (ele != "" && ele != null) return ele;
          });
          if (!(user_id && order_id && reference_id && fingers.length != 0)) {
            return res.status(400).json({
              status: "false",
              message: "Please provide complete data"
            });
          } else {
            fingers.push("packageId");
            Order.findOne({
              where: { id: order_id, reference_id: reference_id },
              include: [
                {
                  model: Cart,
                  include: [
                    {
                      model: Cart_item,
                      attributes: fingers,
                      include: [{ model: Design, as: "design" }]
                    }
                  ]
                }
              ]
            })
              .then(order => {
                if (!order) {
                  return res.status(400).json({
                    status: "false",
                    message: "No data found"
                  });
                } else {
                  if (order.reorder == "yes") {
                    return res.status(400).json({
                      status: "false",
                      message: "Re-order already taken"
                    });
                  } else {
                    Cart.create({
                      status: 0,
                      totalPrice: 0,
                      totalPackage: order.cart.totalPackage,
                      totalItems: order.cart.totalItems,
                      userId: user_id
                    })
                      .then(new_cart => {
                        if (new_cart) {
                          order.cart.cartItems.forEach(async item => {
                            item.lf1 != undefined
                              ? (new_lf1 = item.lf1)
                              : (new_lf1 = [null]);
                            item.lf2 != undefined
                              ? (new_lf2 = item.lf2)
                              : (new_lf2 = [null]);
                            item.lf3 != undefined
                              ? (new_lf3 = item.lf3)
                              : (new_lf3 = [null]);
                            item.lf4 != undefined
                              ? (new_lf4 = item.lf4)
                              : (new_lf4 = [null]);
                            item.lf5 != undefined
                              ? (new_lf5 = item.lf5)
                              : (new_lf5 = [null]);
                            item.rf1 != undefined
                              ? (new_rf1 = item.rf1)
                              : (new_rf1 = [null]);
                            item.rf2 != undefined
                              ? (new_rf2 = item.rf2)
                              : (new_rf2 = [null]);
                            item.rf3 != undefined
                              ? (new_rf3 = item.rf3)
                              : (new_rf3 = [null]);
                            item.rf4 != undefined
                              ? (new_rf4 = item.rf4)
                              : (new_rf4 = [null]);
                            item.rf5 != undefined
                              ? (new_rf5 = item.rf5)
                              : (new_rf5 = [null]);

                            Cart_item.create({
                              lf1: new_lf1,
                              lf2: new_lf2,
                              lf3: new_lf3,
                              lf4: new_lf4,
                              lf5: new_lf5,
                              rf1: new_rf1,
                              rf2: new_rf2,
                              rf3: new_rf3,
                              rf4: new_rf4,
                              rf5: new_rf5,
                              price: 0,
                              cartId: new_cart.id,
                              packageId: item.packageId
                            })
                              .then(new_cart_items => {
                                if (item.design.length > 0) {
                                  Design.create({
                                    lf1: item.design[0].lf1,
                                    lf2: item.design[0].lf2,
                                    lf3: item.design[0].lf3,
                                    lf4: item.design[0].lf4,
                                    lf5: item.design[0].lf5,
                                    rf1: item.design[0].rf1,
                                    rf2: item.design[0].rf2,
                                    rf3: item.design[0].rf3,
                                    rf4: item.design[0].rf4,
                                    rf5: item.design[0].rf5,
                                    userId: user_id,
                                    cartItemId: new_cart_items.id
                                  }).catch(err => {
                                    return res.status(400).json({
                                      status: "false",
                                      err,
                                      message: "Failure"
                                    });
                                  });
                                }
                              })
                              .catch(err => {
                                return res.status(400).json({
                                  status: "false",
                                  err,
                                  message: "Failure"
                                });
                              });
                          });

                          // let raw_query = "select gen_awb(?) as awb";
                          ref_gen.reference(ref_id => {
                            let reference_id = ref_id;
                            axios
                            .get(ENV.LOGISTICS_DELHIVERY_GENERATE_WAYBILL)
                              .then(awb_number => {
                                Order.create({
                                  reference_id,
                                  totalPrice: 0,
                                  totalQuantity: order.cart.totalPackage,
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
                                  cartId: new_cart.id,
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
                                          message: "Order could not be updated"
                                        })
                                      );
                                  })
                                  .catch(err =>
                                    res.json({
                                      status: "false",
                                      err,
                                      message: "Reorder not processed"
                                    })
                                  );
                              })
                              .catch(err =>
                                res.json({
                                  status: "false",
                                  err,
                                  message: "Error in AWB"
                                })
                              );
                          });
                        }
                      })
                      .catch(err =>
                        res.json({
                          status: "false",
                          err,
                          message: "Failure"
                        })
                      );
                  }
                }
              })
              .catch(err =>
                res.json({
                  status: "false",
                  err,
                  message: "Failure"
                })
              );
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
