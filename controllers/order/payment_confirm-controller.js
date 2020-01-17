const Order = require("../../models/order");
const jwt = require("../jwt");
const redis = require("../redis");
const delhivery = require("../../delhivery/assign_wayBill");
const formidable = require("formidable");
const Payment = require("../../models/payment");
const sms = require("../sms");
const User = require("../../models/users");
const Awb = require("../../models/awb_number");
const ENV = require("../../env");
const prefix = ENV.PREFIX;
const sequelize = require("sequelize");
const Cart = require("../../models/cart");
const Cart_item = require("../../models/cart-item");
const Pincode = require("../../models/pincode");
const Sales = require("../../models/sale");
const Address = require("../../models/address");
const payment_status = ENV.PAYMENT_STATUS;
const cod_mode = ENV.COD_MODE;
const cod_min_amt = ENV.COD_MIN_AMT;

exports.paymentDetail = (req, res) => {
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
          const order_id = fields["order_id"];
          const reference_id = fields["reference_id"];
          const tracking_id = fields["tracking_id"];
          var amount = fields["amount"];
          const currency = fields["currency"];
          const bank_ref_no = fields["bank_ref_no"];
          const payment_mode = fields["payment_mode"];
          const card_number = fields["card_number"];
          const order_status = fields["order_status"];
          const status_message = fields["status_message"];
          const status_code = fields["status_code"];
          const comment = fields["comment"];
          let net_payable = 0;
          let payment_comment = null;
          let awb_status;
          amount = parseFloat(amount);
          var sms_message =
            "Hi! Your order is placed with OrderID " +
            reference_id +
            ". We will send you an update when your order is shipped. Thank you for shopping at MadForNails!";

          Order.findOne({
            where: {
              id: order_id,
              userId: user_id,
              reference_id: reference_id,
              internalStatus: "pending"
            },
            include: [
              {
                model: User
              },
              {
                model: Cart,
                include: [
                  {
                    model: Cart_item
                  }
                ]
              }
            ]
          })
            .then(pending_order => {
              if (!pending_order) {
                return res.status(400).json({
                  status: "false",
                  message: "Failure"
                });
              } else {
                net_payable = pending_order.netPayable;
                if (
                  cod_mode == payment_mode.toUpperCase() &&
                  amount <= cod_min_amt
                ) {
                  return res.json({
                    status: "false",
                    message: "COD minimum amount is not fulfilled"
                  });
                } else if (payment_status == order_status.toUpperCase()) {
                  awb_status = true;
                  if (net_payable != amount) {
                    payment_comment = "Fault! Incorrect price recieved.";
                  } else {
                    payment_comment = "Payment successfull.";
                  }
                } else {
                  awb_status = false;
                  payment_comment = "Payment failed from gateway";
                }
                Payment.create({
                  tracking_id: tracking_id,
                  amount: amount,
                  currency: currency,
                  bank_ref_no: bank_ref_no,
                  payment_mode: payment_mode,
                  card_number: card_number,
                  order_status: order_status,
                  status_message: status_message,
                  status_code: status_code,
                  comment: comment
                })
                  .then(payment_create => {
                    if (!payment_create) {
                      return res.status(400).json({
                        status: "false",
                        message: "Failure"
                      });
                    } else {
                      if (awb_status == true) {
                        sms.sendSMS(
                          sms_message,
                          pending_order.user.mobileNumber
                        );

                        delhivery.assign_waybill
                          .then(awb_number => {
                            Order.update(
                              {
                                awb_number: awb_number.data,
                                status: "Order placed successfully!",
                                internalStatus: "fresh",
                                paymentId: payment_create.id,
                                payment_comment: payment_comment
                              },
                              {
                                where: {
                                  id: pending_order.id
                                }
                              }
                            )
                              .then(order_update => {
                                if (order_update) {
                                  Address.findOne({
                                    id: pending_order.addressId
                                  })
                                    .then(delivery_pincode => {
                                      if (delivery_pincode) {
                                        Pincode.findOne({
                                          where: {
                                            pincode: delivery_pincode.zipcode
                                          }
                                        })
                                          .then(partner => {
                                            if (partner) {
                                              Sales.create({
                                                orderId: pending_order.id,
                                                partnerId: partner.partnerId
                                              })
                                                .then(sales_record => {
                                                  if (sales_record) {
                                                    pending_order.cart.cartItems.forEach(
                                                      element => {
                                                        if (
                                                          element.price == 0
                                                        ) {
                                                          User.update(
                                                            {
                                                              claim_freeNail: 1
                                                            },
                                                            {
                                                              where: {
                                                                id:
                                                                  pending_order.userId
                                                              }
                                                            }
                                                          );
                                                        }
                                                      }
                                                    );
                                                    Cart.update(
                                                      {
                                                        status: 0
                                                      },
                                                      {
                                                        where: {
                                                          id:
                                                            pending_order.cartId
                                                        }
                                                      }
                                                    ).catch(err => {
                                                      return res
                                                        .status(400)
                                                        .json({
                                                          status: "false",
                                                          error: err,
                                                          message: "Failure"
                                                        });
                                                    });
                                                    return res
                                                      .status(200)
                                                      .json({
                                                        status: "true",
                                                        message:
                                                          "Order placed successfully",
                                                        reference_id: reference_id
                                                      });
                                                  } else {
                                                    return res
                                                      .status(400)
                                                      .json({
                                                        status: "false",
                                                        message: "Failure"
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
                                              pending_order.cart.cartItems.forEach(
                                                element => {
                                                  if (element.price == 0) {
                                                    User.update(
                                                      {
                                                        claim_freeNail: 1
                                                      },
                                                      {
                                                        where: {
                                                          id:
                                                            pending_order.userId
                                                        }
                                                      }
                                                    );
                                                  }
                                                }
                                              );
                                              Cart.update(
                                                {
                                                  status: 0
                                                },
                                                {
                                                  where: {
                                                    id: pending_order.cartId
                                                  }
                                                }
                                              ).catch(err => {
                                                return res.status(400).json({
                                                  status: "false",
                                                  error: err,
                                                  message: "Failure"
                                                });
                                              });
                                              return res.status(200).json({
                                                status: "true",
                                                message:
                                                  "Order placed successfully",
                                                reference_id: reference_id
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
                                        return res.status(400).json({
                                          status: "false",
                                          message: "Failure"
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
                            status: "Payment Failed!",
                            internalStatus: "failed",
                            paymentId: payment_create.id,
                            payment_comment: payment_comment
                          },
                          {
                            where: {
                              id: pending_order.id
                            }
                          }
                        )
                          .then(order_update => {
                            if (order_update) {
                              return res.status(200).json({
                                status: "false",
                                message: "Payment failed"
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
