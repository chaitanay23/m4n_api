const formidable = require("formidable");
const Order = require("../../models/order");
const Address = require("../../models/address");
const Store = require("../../models/store");
const jwt = require("../jwt");
const redis = require("../redis");
const sequelize = require("sequelize");
const Op = sequelize.Op;
const stringify = require("csv-stringify-as-promised");
const fs = require("fs");
const ENV = require("../../env");
const product_typ_env = ENV.PRODUCTTYPE;
const ship_typ_env = ENV.SHIPTYPE;
const service_type_env = ENV.SERVICETYPE;
const content_env = ENV.CONTENT;
const insured_env = ENV.INSURED;
const per_weight_env = ENV.WEIGHT;

exports.generate_csv = (req, res) => {
  redis.authenticateToken(req.headers.authorization, result => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, (err, fields) => {
          const order_list = array_convert(fields["order_list"]);

          function array_convert(data) {
            data = eval("[" + data + "]");

            return data;
          }
          var datetime = Date.now();
          let record = [];
          let columns = {
            ref_no: "REFERENCE NO",
            name: "CONSIGNEE_NAME",
            add1: "CONSIGNEE_ADD1",
            add2: "CONSIGNEE_ADD2",
            city: "DESTINATION_CITY",
            pincode: "PINCODE",
            mobile: "MOBILE_NO",
            ship_type: "SHIPMENT_TYPE",
            qty: "NO_OF_PCS",
            weight: "WEIGHT",
            product_type: "PRODUCT_TYPE",
            service_type: "SERVICE_TYPE",
            value: "INVOICE_VALUE",
            content: "CONTENT",
            insured: "INSURED_BY",
            awb: "CONSIGNMENT_NO"
          };

          Order.findAll({
            where: {
              id: {
                [Op.in]: order_list
              }
            },
            include: [
              {
                model: Address
              }
            ]
          })
            .then(ready_orders => {
              ready_orders.forEach(order => {
                let package_weight = order.totalQuantity * per_weight_env;
                record.push([
                  order.reference_id,
                  order.address.name,
                  order.address.address,
                  order.address.area,
                  order.address.city,
                  order.address.zipcode,
                  order.address.mobile,
                  ship_typ_env,
                  order.totalQuantity,
                  package_weight,
                  product_typ_env,
                  service_type_env,
                  order.netPayable,
                  content_env,
                  insured_env,
                  order.awb_number
                ]);
              });

              stringify(record, { header: true, columns: columns })
                .then(output => {
                  if (output) {
                    Order.update(
                      {
                        internalStatus: "shipped",
                        status: "Order shipped!"
                      },
                      {
                        where: {
                          id: {
                            [Op.in]: order_list
                          }
                        }
                      }
                    )
                      .then(order_update => {
                        if (order_update) {
                          fs.writeFile(
                            "dtdc_csv/dtdc_upload_" + datetime + ".csv",
                            output,
                            err => {
                              if (err) throw err;
                              return res.status(200).json({
                                status: "true",
                                message: "CSV file ready",
                                file_path:
                                  "/dtdc_csv/dtdc_upload_" + datetime + ".csv"
                              });
                            }
                          );
                        } else {
                          return res.status(400).json({
                            status: "false",
                            message: "Unable to update status"
                          });
                        }
                      })
                      .catch(err => {
                        return res.status(400).json({
                          status: "false",
                          error: err,
                          message: "Error encounttered"
                        });
                      });
                  } else {
                    return res.status(400).json({
                      status: "false",
                      message: "Unable to genrate CSV"
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
