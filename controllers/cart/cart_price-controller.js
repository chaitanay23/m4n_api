const formidable = require('formidable');
const Cart_item = require('../../models/cart-item');
const jwt = require('../jwt');
const redis = require('../redis');

exports.price = (req, res) => {
  redis.authenticateToken(req.headers.authorization, (result) => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, (err, fields, files) => {
          if (err) {
            console.error('Error', err)
            throw err
          }

          var total_price = 0;
          const cart_id = fields["cart_id"];
          Cart_item.findAll({
              where: {
                cartId: cart_id
              }
            })
            .then(cart_item => {
              if (cart_item) {
                cart_item.forEach(function (items) {
                  total_price += items.price;
                })

                return res.status(200).json({
                  status: "true",
                  message: "Price of cart",
                  total_price: total_price
                });
              } else {
                return res.status(400).json({
                  status: "false",
                  message: "Cart items not found"
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
}