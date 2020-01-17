const formidable = require("formidable");
const Order = require("../../models/order");
const jwt = require("../jwt");
const redis = require("../redis");
const sequelize = require("sequelize");

exports.countOrder = (req, res) => {
  redis.authenticateToken(req.headers.authorization, result => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, (err, fields) => {
          if (err) {
            console.error("Error", err);
            throw err;
          }

          const status = fields["internalStatus"];
          const start_date = fields["start_date"];
          const end_date = fields["end_date"];
          //2019-09-23 date sample input
          let grid_query, raw_query;
          if (start_date && end_date) {
            grid_query =
              "SELECT internalStatus,COUNT(*) as count,date(updatedAt) as date FROM `orders` WHERE date(updatedAt) BETWEEN (?) and (?)  and internalStatus != 'pending' and internalStatus != 'failed' GROUP by date(updatedAt),internalStatus";
          } else if (start_date) {
            raw_query =
              "SELECT COUNT(internalStatus) as count FROM `orders` WHERE internalStatus = (?) and date(updatedAt) = (?)";
          } else if (status == "total") {
            if (start_date) {
              grid_query =
                "select COUNT(internalStatus) as count from orders WHERE internalStatus != 'pending' and internalStatus != 'failed' and date(updatedAt) = (?)";
            } else {
              raw_query =
                "select COUNT(internalStatus) as count from orders WHERE internalStatus != 'pending' and internalStatus != 'failed'";
            }
          } else {
            raw_query =
              "select COUNT(internalStatus) as count from orders WHERE internalStatus = (?)";
          }
          if (grid_query) {
            Order.sequelize
              .query(grid_query, {
                type: sequelize.QueryTypes.SELECT,
                replacements: [start_date, end_date]
              })
              .then(order_count => {
                if (order_count) {
                  return res.status(200).json({
                    status: "true",
                    message: "Order count",
                    order_count: order_count
                  });
                } else {
                  return res.status(200).json({
                    status: "true",
                    message: "No order found",
                    order_count: 0
                  });
                }
              })
              .catch(err => {
                return res.status(400).json({
                  status: "false",
                  error: err
                });
              });
          } else {
            Order.sequelize
              .query(raw_query, {
                type: sequelize.QueryTypes.SELECT,
                replacements: [status, start_date, end_date]
              })
              .then(order_count => {
                if (order_count) {
                  return res.status(200).json({
                    status: "true",
                    message: "Order count",
                    order_count: order_count
                  });
                } else {
                  return res.status(200).json({
                    status: "true",
                    message: "No order found",
                    order_count: 0
                  });
                }
              })
              .catch(err => {
                return res.status(400).json({
                  status: "false",
                  error: err
                });
              });
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
