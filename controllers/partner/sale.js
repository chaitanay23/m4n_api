const formidable = require("formidable");
const Sale = require("../../models/sale");
const Partner = require("../../models/partner");
const Order = require("../../models/order");
const sequelize = require("sequelize");
const Cart = require("../../models/cart");
const User = require("../../models/users");
const Address = require("../../models/address");
const CartItem = require("../../models/cart-item");
const Package = require("../../models/package");
const PartnerCommission = require("../../models/partner_commission");
const Op = sequelize.Op;
const jwt = require("../jwt");
const redis = require("../redis");

module.exports.sale = (req, res) => {
  redis.authenticateToken(req.headers.authorization, result => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);
      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, (err, fields) => {
          const partnerId = jwt_result;
          let arr = [];
          let finalArr = [];
          let total_commission = 0;
          let fromDate = fields["fromDate"] + "T00:00:00.000Z";
          let toDate = fields["toDate"] + "T23:59:59.000Z";

          Partner.findOne({
            where: {
              id: partnerId
            }
          })
            .then(partner => {
              if (partner) {
                Sale.findAll({
                  where: {
                    partnerId
                  },
                  attributes: ["orderId", "commission_amount"]
                })
                  .then(values => {
                    values.forEach(value => arr.push(value.orderId));
                    Order.findAll({
                      where: {
                        id: { [Op.in]: arr },
                        createdAt: {
                          [Op.between]: [fromDate, toDate]
                        }
                      },
                      attributes: ["netPayable", "status", "id", "createdAt"],
                      include: [
                        {
                          model: Cart,
                          attributes: ["totalPackage"],
                          include: [
                            {
                              model: CartItem,
                              attributes: ["id"],
                              include: [
                                {
                                  model: Package,
                                  attributes: ["id"],
                                  include: [
                                    {
                                      model: PartnerCommission,
                                      attributes: ["percentage"]
                                    }
                                  ]
                                }
                              ]
                            },
                            {
                              model: User,
                              attributes: ["id"],
                              include: [
                                {
                                  model: Address,
                                  attributes: ["zipcode"]
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    })
                      .then(results => {
                        results.forEach(data => {
                          let order_date = data.createdAt
                            .toISOString()
                            .split("T");
                          let avgCommAmnt = 0;
                          let total = 0;

                          if (data.cart.cartItems[0].package != null) {
                            for (
                              let i = 0;
                              i < data.cart.cartItems.length;
                              i++
                            ) {
                              total +=
                                data.cart.cartItems[i].package
                                  .partnerCommissions[0].percentage;
                              i + 1 == data.cart.cartItems.length
                                ? (avgCommAmnt =
                                    (total / data.cart.cartItems.length / 100) *
                                    data.netPayable)
                                : avgCommAmnt;
                            }
                            total_commission += avgCommAmnt;
                          }

                          finalArr.push({
                            order_id: data.id,
                            date: order_date[0],
                            order_amount: data.netPayable,
                            partner_commission_amount: parseFloat(
                              avgCommAmnt.toFixed(2)
                            ),
                            current_status: data.status,
                            total_packages: data.cart.totalPackage,
                            pincode: data.cart.user.addresses[0].zipcode
                          });

                          Sale.update(
                            {
                              commission_amount: avgCommAmnt
                            },
                            {
                              where: {
                                orderId: data.id,
                                commission_amount: { [Op.eq]: null }
                              }
                            }
                          );
                        });

                        res.status(200).json({
                          data: finalArr,
                          total_commission: parseFloat(
                            total_commission.toFixed(2)
                          ),
                          status: 200
                        });
                      })
                      .catch(() => {
                        res.status(203).json({
                          message: "No data found",
                          status: 203
                        });
                      });
                  })
                  .catch(() => {
                    res.status(203).json({
                      message: "No data found",
                      status: 203
                    });
                  });
              } else {
                res.status(203).json({
                  message: "Partner not found",
                  status: 203
                });
              }
            })
            .catch(() => {
              res.status(400).json({
                message: "Please provide partner id",
                status: 400
              });
            });
        });
      } else {
        res.status(400).json({
          status: 400,
          message: "Token not verified"
        });
      }
    } else {
      res.status(400).json({
        status: 400,
        message: "Partner not Logged In"
      });
    }
  });
};
