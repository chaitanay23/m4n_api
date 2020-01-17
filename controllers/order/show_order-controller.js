const formidable = require("formidable");
const Order = require("../../models/order");
const Package = require("../../models/package");
const Cart = require("../../models/cart");
const Cart_item = require("../../models/cart-item");
const jwt = require("../jwt");
const redis = require("../redis");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const Accessories = require("../../models/accessories");

// need to add this functionality will add later
exports.showOrder = (req, res) => {
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

          Order.findAll({
            where: {
              userId: user_id,
              internalStatus: { [Op.notIn]: ["pending", "failed"] },

              orderId: { [Op.eq]: null }
            },
            include: [
              {
                model: Cart,
                include: [
                  {
                    model: Cart_item,
                    attributes: ["id", "price", "packageId", "preview_image"],
                    include: [
                      {
                        model: Package,
                        attributes: ["name", "id", "description"]
                      },
                      {
                        model: Accessories
                      }
                    ]
                  }
                ]
              }
            ]
          })
            .then(orders => {
              if (orders.length > 0) {
                return res.status(200).json({
                  status: "true",
                  message: "your orders",
                  order: orders
                });
              } else {
                return res.status(200).json({
                  status: "true",
                  message: "no orders found"
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
