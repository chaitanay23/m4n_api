const formidable = require("formidable");
const request = require("request");
const Order = require("../../models/order");
const axios = require("axios");
const Address = require("../../models/address");
const delhivery = require("../../delhivery/assign_wayBill");
const fetch = require("node-fetch");
const rp = require("request-promise");
const jwt = require("../jwt");
const redis = require("../redis");
const ENV = require("../../env");
const Op = require("sequelize").Op;

exports.is_Serviceable = (req, res) => {
  redis.authenticateToken(req.headers.authorization, result => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);
      if (jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, (err, fields, files) => {
          if (err) throw err;

          var address_id = fields["address_id"];
          Address.findOne({
            where: {
              id: address_id
            }
          })
            .then(address => {
              let pincode = address.zipcode;
              let url = ENV.LOGISTICS_DELHIVERY_PINCODE;
              request(
                url + pincode,
                {
                  json: true
                },
                (err, response, body) => {
                  if (err) return console.log(err);

                  if (response.body.delivery_codes.length > 0) {
                    res.status(200).json({
                      status: "true",
                      delivery: "true",
                      data: response.body
                    });
                  } else {
                    res.status(200).json({
                      status: "true",
                      delivery: "false"
                    });
                  }
                }
              );
            })
            .catch(err => {
              res.status(400).json({
                status: "false",
                message: "Failure",
                error: err
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

exports.track_order = (req, res) => {
  redis.authenticateToken(req.headers.authenticateToken, result => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);
      if (jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, (err, fields) => {
          if (err) throw err;
          var order_id = fields["order_id"];
          Order.findOne({
            where: {
              id: order_id,
              internalStatus: {
                [Op.notIn]: ["pending", "failed"]
              }
            }
          })
            .then(orderData => {
              if (!orderData) {
                return res.status(400).json({
                  status: "false",
                  message: "No order found"
                });
              } else {
                if (orderData.internalStatus != "shipped") {
                  return res.status(200).json({
                    status: "true",
                    shipping_status: "false",
                    order_status: orderData.status,
                    order_info: null,
                    last_updated: orderData.updatedAt
                  });
                } else {
                  let url = ENV.LOGISTICS_DELHIVERY_TRACK_ORDER;
                  request(
                    url + orderData.awb_number,
                    {
                      json: true
                    },
                    (err, response, body) => {
                      if (err) return console.log(err);
                      if (!body.ShipmentData) {
                        return res.status(200).json({
                          status: "true",
                          shipping_status: "false",
                          order_status: orderData.status,
                          order_info: null,
                          last_updated: orderData.updatedAt
                        });
                      } else if (
                        body.ShipmentData[0].Shipment.Status.Status ==
                          "Dispatched" ||
                        body.ShipmentData[0].Shipment.Status.Status ==
                          "Delivered"
                      ) {
                        Order.update(
                          {
                            internalStatus: "delivered",
                            status: "Order was Delivered"
                          },
                          {
                            where: {
                              id: order_id
                            }
                          }
                        )
                          .then(result => console.log(result))
                          .catch(err => {
                            console.log(err);
                          });
                      }
                      console.log(body.ShipmentData[0].Shipment.ChargedWeight);
                      return res.status(200).json({
                        status: "true",
                        shipping_status: "true",
                        order_status: orderData.status,
                        last_updated: "",
                        order_info: body
                      });
                    }
                  );
                }
              }
            })
            .catch(err => {
              return res.status(400).json({
                status: "false",
                message: "Failure",
                error: err
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
