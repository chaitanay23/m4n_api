const formidable = require("formidable");
const Order = require("../../models/order");
const Address = require("../../models/address");
const Design = require("../../models/design-image");
const User = require("../../models/users");
const Package = require("../../models/package");
const Finger = require("../../models/finger-size");
const Cart = require("../../models/cart");
const ListItems = require("../../models/list_item");
const Cart_item = require("../../models/cart-item");
const Store = require("../../models/store");
const jwt = require("../jwt");
const redis = require("../redis");
const sequelize = require("sequelize");
const Op = sequelize.Op;
const Accessories = require("../../models/accessories");

exports.showJob = (req, res) => {
  redis.authenticateToken(req.headers.authorization, result => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, (err, fields) => {
          if (err) {
            console.error("Error", err);
            throw err;
          }
          const order_id = fields["order_id"];
          const reference_id = fields["reference_id"];

          Order.findOne({
            where: { id: order_id, reference_id: reference_id },
            include: [
              {
                model: Finger,
                as: "finger"
              },
              {
                model: User
              },
              {
                model: Address
              },
              {
                model: Cart,
                attributes: ["id", "totalPackage", "totalItems"],
                include: [
                  {
                    model: Cart_item,
                    attributes: ["id"],
                    include: [
                      {
                        model: Package,
                        attributes: ["id", "name", "description"]
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
            .then(job_card => {
              return res.json(job_card);
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
  //92rubygreen free nail code
};
