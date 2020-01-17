const formidable = require("formidable");
const Order = require("../../models/order");
const axios = require("axios");
const rp = require("request-promise");
const jwt = require("../jwt");
const redis = require("../redis");
const ENV = require("../../env");
const dtdc_login = ENV.DTDTC_LOGIN;
const dtdc_track = ENV.DTDC_TRACK;

exports.track_order = (req, res) => {
  redis.authenticateToken(req.headers.authorization, result => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, (err, fields, files) => {
          if (err) {
            console.error("Error", err);
            throw err;
          }

          var order_id = fields["order_id"];

          Order.findOne({
            where: {
              id: order_id
            }
          }).then(order => {
            if (order.internalStatus != "shipped") {
              res.json({
                status: "true",
                shipping_status: "false",
                order_status: order.status,
                last_updated: order.updatedAt
              });
            } else {
              var dtdc_token;
              var awb_number = order.awb_number;

              axios
                .get(dtdc_login)
                .then(resp => {
                  dtdc_token = resp.data;

                  rp({
                    method: "POST",
                    headers: {
                      "content-type": "application/json",
                      "X-Access-Token": dtdc_token
                    },

                    json: true,
                    url: dtdc_track,
                    body: {
                      trkType: "cnno",
                      strcnno: awb_number,
                      addtnlDtl: "Y"
                    }
                  })
                    .then(response => {
                      if (response.status != "SUCCESS") {
                        return res.status(400).json({
                          status: "false",
                          shipping_status: "false"
                        });
                      } else {
                        if (response.trackHeader["strStatus"] == "Delivered") {
                          Order.update(
                            {
                              internalStatus: "delivered",
                              status: "Order was Delivered"
                            },
                            {
                              where: {
                                id: fields["order_id"]
                              }
                            }
                          )
                            .then(result => console.log(result))
                            .catch(err => {
                              console.log(err);
                            });
                        }
                        res.json({
                          status: "true",
                          shipping_status: "true",
                          order_status: {
                            order_location:
                              response.trackDetails[
                                response.trackDetails.length - 1
                              ]["strDestination"],
                            latest_status: response.trackHeader["strStatus"],
                            last_updated:
                              response.trackHeader["strStatusTransOn"] +
                              " at " +
                              response.trackHeader["strStatusTransTime"]
                          }
                        });
                      }
                    })
                    .catch(err => console.log(err));
                })
                .catch(err => console.log(err));
            }
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
