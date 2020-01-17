const formidable = require("formidable");
const Cart = require("../../models/cart");
const Cart_item = require("../../models/cart-item");
const jwt = require("../jwt");
const redis = require("../redis");
const Product = require("../../models/product");

exports.removeProduct = (req, res) => {
  redis.authenticateToken(req.headers.authorization, result => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, (err, fields, files) => {
          if (err) {
            console.error("Error", err);
            throw err;
          }
          const cart_id = fields["cart_id"];
          const user_id = jwt_result;
          const cart_item_id = fields["cart_item_id"];
          let updated_price = 0;
          let updated_status = 0;
          let updated_package = 0;
          let updated_item = 0;

          if (cart_id && user_id && cart_item_id) {
            Cart_item.findOne({
              where: {
                id: cart_item_id
              }
            })
              .then(cart_item => {
                if (!cart_item) {
                  return res.status(400).json({
                    status: "false",
                    message: "Cart item not found"
                  });
                } else {
                  const items_array = [
                    ...cart_item.lf1,
                    ...cart_item.lf2,
                    ...cart_item.lf3,
                    ...cart_item.lf4,
                    ...cart_item.lf5,
                    ...cart_item.rf1,
                    ...cart_item.rf2,
                    ...cart_item.rf3,
                    ...cart_item.rf4,
                    ...cart_item.rf5
                  ];

                  Cart.findOne({
                    where: {
                      id: cart_id
                    }
                  }).then(cart => {
                    if (cart) {
                      updated_price = cart.totalPrice - cart_item.price;
                      if (cart_item.packageId) {
                        updated_package = cart.totalPackage - 1;
                      } else {
                        updated_package = cart.totalPackage;
                      }
                      updated_item = cart.totalItems - items_array.length;
                      if (updated_package == 0 && updated_item == 0) {
                        updated_status = 0;
                      } else {
                        updated_status = 1;
                      }
                      Cart.update(
                        {
                          totalPrice: updated_price,
                          totalPackage: updated_package,
                          totalItems: updated_item,
                          status: updated_status
                        },
                        {
                          where: {
                            id: cart.id
                          }
                        }
                      )
                        .then(cart_update => {
                          var promise = cart_item.destroy();
                          if (promise) {
                            return res.status(200).json({
                              status: "true",
                              message: "Item deleted from cart"
                            });
                          } else {
                            return res.status(400).json({
                              status: "false",
                              message: "Not able to delete item"
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
                }
              })
              .catch(err => {
                return res.status(400).json({
                  status: "false",
                  error: err,
                  message: "Cart not found"
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
