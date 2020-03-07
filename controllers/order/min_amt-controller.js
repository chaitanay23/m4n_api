const Cart = require("../../models/cart");
const ENV = require("../../env");
const cod_min_amt = ENV.COD_MIN_AMT;
const cod_mode = ENV.COD_MODE;
const jwt = require("../jwt");
const redis = require("../redis");
const formidable = require("formidable");

exports.amt_check = (req, res) => {
  redis.authenticateToken(req.headers.authorization, result => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, async (err, fields, files) => {
          if (err) {
            console.error("Error", err);
            throw err;
          }

          const cart_id = fields["cart_id"];
          const payment_mode = fields["payment_mode"];
          const user_id = jwt_result;
          if (!(cart_id && payment_mode && user_id)) {
            return res.status(400).json({
              status: "false",
              message: "Provide complete data"
            });
          } else {
            Cart.findOne({
              where: {
                id: cart_id,
                userId: user_id
              }
            })
              .then(cart => {
                if (!cart) {
                  return res.status(400).json({
                    status: "false",
                    message: "No cart found"
                  });
                } else {
                  if (
                    cod_mode == payment_mode.toUpperCase() &&
                    cart.totalPrice < cod_min_amt
                  ) {
                    msg =
                      "Cash on delivery is available on orders above Rs. " +
                      cod_min_amt;
                    return res.status(400).json({
                      status: "false",
                      message: msg
                    });
                  } else {
                    return res.status(200).json({
                      status: "true",
                      message: "Proceed for order"
                    });
                  }
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
