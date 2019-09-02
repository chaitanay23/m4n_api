const formidable = require('formidable');
const Cart = require('../../models/cart');
const Cart_item = require('../../models/cart-item');
const jwt = require('../jwt');
const redis = require('../redis');
const Product = require('../../models/product');

//request user id and item which is in a json formate and it will contain various products
exports.addCart = (req, res) => {
  redis.authenticateToken(req.headers.authorization, (result) => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, async (err, fields, files) => {
          if (err) {
            console.error('Error', err)
            throw err
          }

          const user_id = jwt_result;
          const items = fields["items"];
          let product_set = [];
          let list = null;
          let total_price = 0;
          await Product.findAll({
              where: {
                product_type: 'free_nail'
              }
            })
            .then(free_product => {
              if (free_product.length > 0) {
                free_product.forEach(element => {
                  product_set.push(element.id)
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

          if (user_id != null) {
            Cart.findOne({
                where: {
                  userId: user_id,
                  status: "1"
                }
              })
              .then(cart => {
                if (cart != null) {
                  if (items) {
                    if (typeof (items) != 'string') {
                      list = items;
                    } else {
                      list = JSON.parse(items);
                    }
                    if (list) {
                      list.forEach(function (detail) {
                        if (parseInt(detail.quantity, 10) && detail.price >= 0 && parseInt(detail.product_id, 10)) {
                          if (product_set.includes(detail.product_id) && detail.quantity > 1) {
                            return res.status(400).json({
                              status: "false",
                              message: "You can't add more than 1 free product"
                            });
                          } else if (detail.product_id) {
                            Cart_item.findAll({
                                where: {
                                  productId: detail.product_id,
                                  cartId: cart.id
                                }
                              })
                              .then(cart_product => {
                                if (cart_product.length > 0) {
                                  return res.status(400).json({
                                    status: "false",
                                    message: "Item already added to cart"
                                  });
                                } else {
                                  total_price = detail.price * detail.quantity;
                                  Cart_item.create({
                                      quantity: detail.quantity,
                                      finger_id: detail.finger_id,
                                      hand_id: detail.hand_id,
                                      cartId: cart.id,
                                      price: total_price,
                                      productId: detail.product_id,
                                    })
                                    .then(cart_item => {
                                      return res.status(200).json({
                                        status: "true",
                                        message: "Items added to cart",
                                        cart_id: cart.id
                                      });
                                    })
                                    .catch(err => {
                                      return res.status(400).json({
                                        status: "false",
                                        error: err,
                                        message: "Failure"
                                      });
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
                        } else {
                          return res.status(400).json({
                            status: "false",
                            message: "Please provide correct value"
                          });
                        }
                      })
                    } else {
                      return res.status(400).json({
                        status: "false",
                        message: "Please provide valid json"
                      });
                    }
                  } else {
                    return res.status(400).json({
                      status: "false",
                      message: "No item selected for cart"
                    });
                  }
                } else {
                  Cart.create({
                      userId: user_id,
                      status: "1",
                    })
                    .then(new_cart => {
                      if (items) {
                        if (typeof (items) != 'string') {
                          list = items;
                        } else {
                          list = JSON.parse(items);
                        }
                        list.forEach(async function (detail) {
                          if (parseInt(detail.quantity, 10) && detail.price >= 0 && parseInt(detail.product_id, 10)) {
                            if (product_set.includes(detail.product_id) && detail.quantity > 1) {
                              Cart.destroy({
                                where: {
                                  id: new_cart.id
                                }
                              });
                              return res.status(400).json({
                                status: "false",
                                message: "You can't add more than 1 free product"
                              });
                            } else {
                              total_price = detail.price * detail.quantity;
                              await Cart_item.create({
                                  quantity: detail.quantity,
                                  finger_id: detail.finger_id,
                                  hand_id: detail.hand_id,
                                  cartId: new_cart.id,
                                  price: total_price,
                                  productId: detail.product_id,
                                })
                                .then(cart_item => {
                                  return res.status(200).json({
                                    status: "true",
                                    message: "Items added to cart",
                                    cart_id: new_cart.id
                                  });
                                })
                                .catch(err => {
                                  return res.status(400).json({
                                    status: "false",
                                    error: err,
                                    message: "Failure"
                                  });
                                });
                            }
                          } else {
                            return res.status(400).json({
                              status: "false",
                              message: "Please provide correct value"
                            });
                          }
                        })
                      } else {
                        return res.status(400).json({
                          status: "false",
                          message: "No item selected for cart"
                        });
                      }
                    })
                }
              })
              .catch(err => {
                return res.status(400).json({
                  status: "false",
                  error: err,
                  message: "Failure"
                });
              });
          } else {
            return res.status(400).json({
              status: "false",
              message: "Please provide user"
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
}