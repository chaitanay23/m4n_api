const formidable = require("formidable");
const Order = require("../../models/order");
const Address = require("../../models/address");
const Store = require("../../models/store");
const Cart = require("../../models/cart");
const Cart_item = require("../../models/cart-item");
const Package = require("../../models/package");
const jwt = require("../jwt");
const redis = require("../redis");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const Payment = require("../../models/payment");
const Design = require("../../models/design-image");
const Accessories = require("../../models/accessories");

exports.orderDetail = (req, res) => {
  redis.authenticateToken(req.headers.authorization, result => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, async (err, fields, files) => {
          if (err) {
            console.error("Error", err);
            throw err;
          }
          const user_id = jwt_result;
          const reference_id = fields["reference_id"];
          const order_id = fields["order_id"];

          Order.findOne({
            where: {
              id: order_id,
              reference_id: reference_id,
              userId: user_id
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
                        model: Design,
                        as: "design"
                      },
                      {
                        model: Accessories
                      }
                    ]
                  }
                ]
              },
              {
                model: Payment
              },
              {
                model: Address
              }
            ]
          })
            .then(order_detail => {
              if (order_detail) {
                return res.status(200).json({
                  status: "true",
                  message: "Order details",
                  order: order_detail
                });
              } else {
                return res.status(400).json({
                  status: "false",
                  message: "Failure"
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
