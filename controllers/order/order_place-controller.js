const formidable = require("formidable");
const jwt = require("../jwt");
const redis = require("../redis");
const coupon_calulation = require("../coupon_calculation");
const gst_calculation = require("../gst_calculation");
const delivery_charge = require("../delivery_charge");
const Address = require("../../models/address");
const Cart = require("../../models/cart");
const Cart_item = require("../../models/cart-item");
const Package = require("../../models/package");
const User = require("../../models/users");
const MobileDetect = require("mobile-detect");

exports.listOrder = (req, res) => {
  redis.authenticateToken(req.headers.authorization, result => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, (err, fields, files) => {
          if (err) {
            console.error("Error", err);
            throw err;
          }
          const user_id = jwt_result;
          const address_id = fields["address_id"];
          const cart_id = fields["cart_id"];
          const coupon_id = fields["coupon_id"];
          let coupon_discount = 0;
          let net_payable = 0;
          let coupon_msg;
          let user_email = null;
          if (!(cart_id && address_id)) {
            return res.status(400).json({
              status: "false",
              message: "Provide cart and address details"
            });
          }
          Address.findOne({
            where: {
              id: address_id,
              userId: user_id
            },
            attributes: [
              "name",
              "mobile",
              "type",
              "state",
              "city",
              "area",
              "zipcode",
              "address"
            ],
            include: [
              {
                model: User,
                attributes: ["email"]
              }
            ]
          })
            .then(address => {
              user_email = address.user.email;
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
                attributes: [
                  "id",
                  "status",
                  "totalPrice",
                  "totalPackage",
                  "totalItems"
                ]
              })
                .then(resp => {
                  const dtdc_charge = delivery_charge.deliveryCharge(
                    resp.totalPrice,
                    address.zipcode
                  );
                  gst_calculation.tax_amt(resp.totalPrice, package_gst => {
                    gst_calculation.tax_amt(dtdc_charge, delivery_gst => {
                      net_payable = resp.totalPrice + dtdc_charge;
                      const md = new MobileDetect(req.headers["user-agent"]);
                      let user_agent = md.os() ? md.os() : md.ua;

                      User.update(
                        { user_agent: user_agent },
                        { where: { id: user_id } }
                      )
                        .then(agent_updated => {
                          coupon_calulation.discountCal(
                            coupon_id,
                            user_id,
                            cart_id,
                            response => {
                              coupon_discount = response.discount;
                              coupon_msg = response.msg;
                              net_payable =
                                resp.totalPrice + dtdc_charge - coupon_discount;
                              if (coupon_discount > 0) {
                                coupon_status = true;
                              } else {
                                coupon_status = false;
                              }
                              return res.status(200).json({
                                status: "true",
                                cart: resp,
                                package_gst: package_gst,
                                delivery_gst: delivery_gst,
                                delivery_charge: dtdc_charge,
                                address: address,
                                user_email: user_email,
                                net_payable: net_payable,
                                coupon_status: coupon_status,
                                coupon_discount: coupon_discount,
                                message: coupon_msg
                              });
                            }
                          );
                        })
                        .catch(err => {
                          return res.status(400).json({
                            status: "false",
                            error: err,
                            message: "Failure"
                          });
                        });
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
            })
            .catch(err =>
              res.json({
                status: "false",
                error: err,
                message: "No address"
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
