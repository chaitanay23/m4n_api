const formidable = require("formidable");
const Design = require("../../models/design-image");
const Package = require("../../models/package");
const Cart = require("../../models/cart");
const ListItems = require("../../models/list_item");
const Cart_item = require("../../models/cart-item");
const jwt = require("../jwt");
const redis = require("../redis");
const sequelize = require("sequelize");
const Op = sequelize.Op;

exports.jobCardDetail = (req, res) => {
  redis.authenticateToken(req.headers.authorization, result => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, (err, fields) => {
          if (err) {
            console.error("Error", err);
            throw err;
          }

          const cart_item = fields["cart_item_id"];
          Cart_item.findOne({
            where: { id: cart_item },
            include: [
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
          })
            .then(async cart => {
              cart.lf1 = await ListItems.findAll({
                where: { id: { [Op.in]: cart.lf1 } },
                attributes: ["id", "item_code", "type"]
              });
              cart.lf2 = await ListItems.findAll({
                where: { id: { [Op.in]: cart.lf2 } },
                attributes: ["id", "item_code", "type"]
              });
              cart.lf3 = await ListItems.findAll({
                where: { id: { [Op.in]: cart.lf3 } },
                attributes: ["id", "item_code", "type"]
              });
              cart.lf4 = await ListItems.findAll({
                where: { id: { [Op.in]: cart.lf4 } },
                attributes: ["id", "item_code", "type"]
              });
              cart.lf5 = await ListItems.findAll({
                where: { id: { [Op.in]: cart.lf5 } },
                attributes: ["id", "item_code", "type"]
              });
              cart.rf2 = await ListItems.findAll({
                where: { id: { [Op.in]: cart.rf2 } },
                attributes: ["id", "item_code", "type"]
              });
              cart.rf1 = await ListItems.findAll({
                where: { id: { [Op.in]: cart.rf1 } },
                attributes: ["id", "item_code", "type"]
              });
              cart.rf3 = await ListItems.findAll({
                where: { id: { [Op.in]: cart.rf3 } },
                attributes: ["id", "item_code", "type"]
              });
              cart.rf4 = await ListItems.findAll({
                where: { id: { [Op.in]: cart.rf4 } },
                attributes: ["id", "item_code", "type"]
              });
              cart.rf5 = await ListItems.findAll({
                where: { id: { [Op.in]: cart.rf5 } },
                attributes: ["id", "item_code", "type"]
              });

              return res.json({
                status: "true",
                message: "Package detail",
                package_items: cart
              });
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
