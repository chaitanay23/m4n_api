const formidable = require("formidable");
const Order = require("../../models/order");
const jwt = require("../jwt");
const redis = require("../redis");
const sequelize = require("sequelize");

exports.showOrder = (req, res) => {
  redis.authenticateToken(req.headers.authorization, result => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, async (err, fields) => {
          if (err) {
            console.error("Error", err);
            throw err;
          }

          const status = fields["internalStatus"];
          const date = fields["date"];

          if (status != null) {
            if (date) {
              raw_query =
                "select * from orders WHERE internalStatus = (?) and date(updatedAt) = (?)";
            } else {
              raw_query = "select * from orders WHERE internalStatus = (?)";
            }
            Order.sequelize
              .query(raw_query, {
                type: sequelize.QueryTypes.SELECT,
                replacements: [status, date]
              })
              .then(list => {
                if (list) {
                  return res.status(200).json({
                    status: "true",
                    message: "list of orders",
                    date: date,
                    orders: list
                  });
                } else {
                  return res.status(400).json({
                    status: "false",
                    message: "no orders in list"
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
              message: "please provide status"
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
