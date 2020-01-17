const formidable = require("formidable");
const Sale = require("../../models/sale");
const Partner = require("../../models/partner");
const Order = require("../../models/order");
const sequelize = require("sequelize");
const Op = sequelize.Op;
const jwt = require("../jwt");
const redis = require("../redis");

module.exports.users = (req, res) => {
  redis.authenticateToken(req.headers.authorization, result => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, (err, fields) => {
          const partnerId = jwt_result;
          let totalUsers = [];

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
                  }
                })
                  .then(orders => {
                    let arr = [];
                    orders.forEach(result => arr.push(result.orderId));
                    Order.findAll({
                      where: {
                        id: { [Op.in]: arr }
                      }
                    })
                      .then(results => {
                        results.forEach(value => {
                          if (
                            totalUsers.length == 0 ||
                            !totalUsers.includes(value.userId)
                          ) {
                            totalUsers.push(value.userId);
                          }
                        });
                        res.status(200).json({
                          totalUsers: totalUsers.length,
                          status: 200
                        });
                      })
                      .catch(() => {
                        res.json({
                          message: "No orders placed",
                          status: 203
                        });
                      });
                  })
                  .catch(() => {
                    res.json({
                      message: "No orders placed",
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
