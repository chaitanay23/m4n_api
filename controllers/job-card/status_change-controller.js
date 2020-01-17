const formidable = require("formidable");
const Order = require("../../models/order");
const jwt = require("../jwt");
const redis = require("../redis");
const sequelize = require("sequelize");
const Op = sequelize.Op;

exports.internal_status = (req, res) => {
  redis.authenticateToken(req.headers.authorization, result => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, async (err, fields) => {
          if (err) {
            console.error("Error", err);
            throw err;
          }

          const status = [
            "fresh",
            "processing",
            "quality",
            "reject",
            "ready_to_ship",
            "shipped"
          ];
          function array_convert(data) {
            data = eval("[" + data + "]");

            return data;
          }
          const order_id = array_convert(fields["order_id"]);
          const internalStatus = fields["internalStatus"];
          let order_status = null;
          let order_detail = null;
          let comment = null;

          if (!internalStatus) {
            return res.status(400).json({
              status: "false",
              message: "please provide status"
            });
          }
          if (!status.includes(internalStatus)) {
            return res.status(400).json({
              status: "false",
              message: "Provide proper status for order"
            });
          }
          if (
            internalStatus == "shipped" ||
            internalStatus == "ready_to_ship" ||
            internalStatus == "fresh" ||
            internalStatus == "processing" ||
            internalStatus == "quality"
          ) {
            if (internalStatus == "shipped") {
              order_status = "Order shipped!";
            } else if (internalStatus == "ready_to_ship") {
              order_status = "Order packed & ready to ship!";
            } else if (
              internalStatus == "fresh" ||
              internalStatus == "processing" ||
              internalStatus == "quality"
            ) {
              order_status = "Order is processing!";
            }

            if (order_id.length > 0) {
              Order.update(
                {
                  internalStatus: internalStatus,
                  status: order_status
                },
                {
                  where: {
                    id: { [Op.in]: order_id }
                  }
                }
              )
                .then(status => {
                  if (status != 0) {
                    return res.status(200).json({
                      status: "true",
                      message: "Order status changed"
                    });
                  } else {
                    return res.status(400).json({
                      status: "false",
                      message: "Error while updating status"
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
              return res.status(400).json({
                status: "false",
                message: "No orders found"
              });
            }
          } else if (internalStatus == "reject") {
            comment = fields["comment"];
            order_status = "Order is processing!";

            if (order_id.length > 0) {
              Order.update(
                {
                  internalStatus: internalStatus,
                  status: order_status,
                  comment: comment
                },
                {
                  where: {
                    id: { [Op.in]: order_id }
                  }
                }
              )
                .then(status => {
                  if (status != 0) {
                    return res.status(200).json({
                      status: "true",
                      message: "Order status changed"
                    });
                  } else {
                    return res.status(400).json({
                      status: "false",
                      message: "Error while updating status"
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
              return res.status(400).json({
                status: "false",
                message: "No orders found"
              });
            }
          } else {
            return res.status(400).json({
              status: "false",
              message: "Wrong status given"
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
