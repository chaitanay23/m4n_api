const formidable = require("formidable");
const Order = require("../../models/order");
const Address = require("../../models/address");
const Store = require("../../models/store");
const Cart = require("../../models/cart");
const Cart_item = require("../../models/cart-item");
const Finger = require("../../models/finger-size");
const jwt = require("../jwt");
const redis = require("../redis");
const Sequelize = require("sequelize");
const Package = require("../../models/package");
const Design = require("../../models/design-image");
const Op = Sequelize.Op;

exports.orderDetail = (req, res) => {
  redis.authenticateToken(req.headers.authorization, result => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, async (err, fields, files) => {
          if (err) {
            return res.status(500).json({
              status: "false",
              message: "Error",
              error: err
            });
          }
          const user_id = jwt_result;
          const order_id = fields["order_id"];
          const ref_id = fields["reference_id"];

          Order.findOne({
            where: {
              id: order_id,
              reference_id: ref_id
            },
            include: [
              {
                model: Cart,
                include: [
                  {
                    model: Cart_item,
                    include: [
                      {
                        model: Package
                      },
                      {
                        model: Design,
                        as: "design",
                        attributes: [
                          "id",
                          "lf1",
                          "lf2",
                          "lf3",
                          "lf4",
                          "lf5",
                          "rf1",
                          "rf2",
                          "rf3",
                          "rf4",
                          "rf5"
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                model: Address
              }
            ]
          })
            .then(order => {
              res.json({
                status: "true",
                order
              });
            })
            .catch(err =>
              res.json({
                status: "false",
                message: err
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
