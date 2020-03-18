const formidable = require("formidable");
const Order = require("../../models/order");
const Address = require("../../models/address");
const Payment = require("../../models/payment");
const Store = require("../../models/store");
const jwt = require("../jwt");
const redis = require("../redis");
const sequelize = require("sequelize");
const Op = sequelize.Op;
const stringify = require("csv-stringify-as-promised");
const fs = require("fs");
const ENV = require("../../env");
const content_env = ENV.CONTENT;
const per_weight_env = ENV.WEIGHT;
const country_env = ENV.COUNTRY;
var payment_mode_env = ENV.PAYMENT_MODE;
var cod_env = ENV.COD_AMT;
const return_add_env = ENV.RETURN_ADDRESS;
const seller_address = ENV.SELLER_ADDRESS;
const return_pin_env = ENV.RETURN_PIN;
const seller_name_env = ENV.SELLER_NAME;
const hsn_env = ENV.HSN;
const cod_mode = ENV.COD_MODE;
var complete_address = "";

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
          //as discussed over call on 12th march with factory
          let package_qty = 1;
          let columns = {
            awb: "Waybill",
            ref_no: "Reference No",
            name: "Consignee Name",
            city: "City",
            state: "State",
            country: "Country",
            add: "Address",
            pincode: "Pincode",
            phone: "Phone",
            mobile: "Mobile",
            weight: "Weight",
            payment_type: "Payment Mode",
            value: "Package Amount",
            cod_amt: "Cod Amount",
            content: "Product to be Shipped",
            return_address: "Return Address",
            return_pin: "Return Pin",
            seller_name: "Seller Name",
            seller_add: "Seller Address",
            seller_cst: "Seller CST No",
            seller_tin: "Seller TIN",
            invoice: "Invoice No",
            invoice_date: "Invoice Date",
            qty: "Quantity",
            commodity: "Commodity Value",
            tax: "Tax Value",
            category: "Category of Goods",
            seller_gst: "Seller_GST_TIN",
            hsn: "HSN_Code",
            return_rsn: "Return Reason",
            vendor: "Vendor Pickup Location",
            ewbn: "EWBN"
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
              },
              {
                model: Payment
              }
            ]
          })
            .then(ready_orders => {
              ready_orders.forEach(order => {
                let package_weight = order.totalQuantity * per_weight_env;
                if (order.payment.payment_mode.toUpperCase() == cod_mode) {
                  cod_env = order.netPayable;
                  payment_mode_env = cod_mode;
                } else {
                  cod_env = ENV.COD_AMT;
                  payment_mode_env = ENV.PAYMENT_MODE;
                }
                complete_address =
                  order.address.address + ", " + order.address.area;
                record.push([
                  order.awb_number, // awb
                  order.reference_id, // ref_no
                  order.address.name, // name
                  order.address.city, // city
                  order.address.state, // state
                  country_env, // country
                  complete_address, // address
                  order.address.zipcode, // pincode
                  null, // phone
                  order.address.mobile, // mobile
                  package_weight, // weight
                  payment_mode_env, // payment_type
                  order.netPayable, // value
                  cod_env, // cod_amt
                  content_env, // content
                  return_add_env, // return_address
                  return_pin_env, // return_pin
                  seller_name_env, // seller_name
                  seller_address, // seller_add
                  null, // seller_cst
                  null, // seller_tin
                  null, // invoice
                  null, // invoice_date
                  package_qty,//order.totalQuantity, // qty
                  null, // commodity
                  null, // tax
                  null, // category
                  null, // seller_gst
                  hsn_env, // hsn
                  null, // return_rsn
                  null, // vendor
                  null // ewbn
                ]);
              });

              stringify(record, {
                header: true,
                columns: columns
              })
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
                            "dtdc_csv/logistics_upload_" + datetime + ".csv",
                            output,
                            err => {
                              if (err) throw err;
                              return res.status(200).json({
                                status: "true",
                                message: "CSV file ready",
                                file_path:
                                  "/dtdc_csv/logistics_upload_" +
                                  datetime +
                                  ".csv"
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
