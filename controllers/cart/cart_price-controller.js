const formidable = require("formidable");
const Cart = require("../../models/cart");
const jwt = require("../jwt");
const redis = require("../redis");

exports.price = (req, res) => {
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
          Cart.findOne({
            where: {
              userId: user_id,
              status: 1
            }
          })
            .then(cart => {
              if (!cart) {
                return res.status(400).json({
                  status: "false",
                  message: "Cart not found"
                });
              } else {
                return res.status(200).json({
                  status: "true",
                  message: "Price of cart",
                  total_price: cart.totalPrice
                });
              }
            })
            .catch(err => {
              return res.status(400).json({
                status: "false",
                error: err,
                message: "Cart not found"
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
