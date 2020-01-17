const formidable = require("formidable");
const Cart = require("../../models/cart");
const Cart_item = require("../../models/cart-item");
const Design = require("../../models/design-image");
const Package = require("../../models/package");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const jwt = require("../jwt");
const redis = require("../redis");
const Accessories = require("../../models/accessories");

exports.showCart = (req, res) => {
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

          Cart.findOne({
            where: {
              userId: user_id,
              status: 1
            }
          }).then(cart => {
            if (!cart) {
              return res.status(400).json({
                status: "false",
                message: "No cart found"
              });
            } else {
              Cart_item.findAll({
                where: {
                  cartId: cart.id
                },
                attributes: [
                  "id",
                  "price",
                  "packageId",
                  "cartId",
                  "preview_image"
                ],
                include: [
                  {
                    model: Package,
                    attributes: ["id", "name", "description"]
                  },
                  {
                    model: Design,
                    as: "design"
                  },
                  {
                    model: Accessories
                  }
                ]
              })
                .then(cart_detail => {
                  if (!cart_detail) {
                    return res.status(400).json({
                      status: "false",
                      message: "No cart items found"
                    });
                  } else {
                    return res.status(200).json({
                      status: "true",
                      message: "Cart items found",
                      cart: cart,
                      cart_items: cart_detail
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
            }
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
