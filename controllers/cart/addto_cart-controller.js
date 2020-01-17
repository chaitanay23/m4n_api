const formidable = require("formidable");
const Cart = require("../../models/cart");
const Cart_item = require("../../models/cart-item");
const jwt = require("../jwt");
const redis = require("../redis");
const List_item = require("../../models/list_item");
const Package = require("../../models/package");
const User = require("../../models/users");
const sequelize = require("sequelize");
const Op = sequelize.Op;
const short = require("short-uuid");
const fs = require("fs");
const Accessories = require("../../models/accessories");

exports.addCart = (req, res) => {
  redis.authenticateToken(req.headers.authorization, result => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, async (err, fields, files) => {
          if (err) {
            console.error("Error", err);
            throw err;
          }

          function array_convert(data) {
            if (data) {
              data = eval("[" + data + "]");
            }

            return data;
          }

          function previewUpload(base64String) {
            if (base64String != null) {
              let base64Image = base64String.split(";base64,").pop();
              let uuid = short.generate();
              var new_path = "./design-uploads/" + uuid + ".png";
              fs.writeFile(
                new_path,
                base64Image,
                { encoding: "base64" },
                function(err) {
                  console.log("File created");
                }
              );
              var db_path = new_path.slice(1, new_path.length);

              return db_path;
            }
          }

          const user_id = jwt_result;
          var lf1 = array_convert(fields["lf1"]);
          var lf2 = array_convert(fields["lf2"]);
          var lf3 = array_convert(fields["lf3"]);
          var lf4 = array_convert(fields["lf4"]);
          var lf5 = array_convert(fields["lf5"]);
          var rf1 = array_convert(fields["rf1"]);
          var rf2 = array_convert(fields["rf2"]);
          var rf3 = array_convert(fields["rf3"]);
          var rf4 = array_convert(fields["rf4"]);
          var rf5 = array_convert(fields["rf5"]);
          const preview = previewUpload(fields["preview_image"]);
          const package_id = fields["package_id"];
          const accessory_id = fields["accessory_id"];
          let free_nail = false;
          /*
                      extras : INPUT = {ids of additional items put on all nails apart from the package cost}
                    SAMPLE INPUT = {"items":[{"id":"1","count":"1"},{"id":"2","count":"2"}]}
                      OUTPUT = {calculates the price of each id in the extra to calculate the final price of package}
                    */

          let extras = fields["extras"];
          if (accessory_id) {
            Accessories.findOne({
              where: { id: accessory_id }
            }).then(kit => {
              if (!kit) {
                return res.status(400).json({
                  status: "false",
                  message: "No accessory found"
                });
              } else {
                Cart.findOne({
                  where: { userId: user_id, status: 1 }
                }).then(active_cart => {
                  if (active_cart) {
                    Cart_item.create({
                      cartId: active_cart.id,
                      price: kit.price,
                      preview_image: kit.imageUrl,
                      accessoryId: accessory_id
                    }).then(new_cart_item => {
                      if (!new_cart_item) {
                        return res.status(400).json({
                          status: "false",
                          message: "Failure"
                        });
                      } else {
                        let new_price = active_cart.totalPrice + kit.price;
                        let new_item = active_cart.totalItems + 1;
                        Cart.update(
                          {
                            totalPrice: new_price,
                            totalItems: new_item
                          },
                          { where: { id: active_cart.id } }
                        )
                          .then(cart_updated => {
                            return res.status(200).json({
                              status: "true",
                              message: "Items added to cart",
                              cart_id: active_cart.id,
                              cart_item_id: new_cart_item.id
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
                    });
                  } else {
                    Cart.create({
                      status: 1,
                      totalPrice: kit.price,
                      totalPackage: 0,
                      totalItems: 1,
                      userId: user_id
                    }).then(new_cart => {
                      if (!new_cart) {
                        return res.status(400).json({
                          status: "false",
                          message: "Failure"
                        });
                      } else {
                        Cart_item.create({
                          cartId: new_cart.id,
                          price: kit.price,
                          preview_image: kit.imageUrl,
                          accessoryId: accessory_id
                        }).then(new_cart_item => {
                          if (!new_cart_item) {
                            return res.status(400).json({
                              status: "false",
                              message: "Failure"
                            });
                          } else {
                            return res.status(200).json({
                              status: "true",
                              message: "Items added to cart",
                              cart_id: new_cart.id,
                              cart_item_id: new_cart_item.id
                            });
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
          } else if (
            !(
              lf1 &&
              lf2 &&
              lf3 &&
              lf4 &&
              lf5 &&
              rf1 &&
              rf2 &&
              rf3 &&
              rf4 &&
              rf5 &&
              preview &&
              package_id
            )
          ) {
            return res.status(400).json({
              status: "false",
              message: "Provide complete data"
            });
          } else {
            let total_price = 0;
            let total_items = 0;
            let total_package = 0;
            let price_array = [];

            const combine_items = [
              ...lf1,
              ...lf2,
              ...lf3,
              ...lf4,
              ...lf5,
              ...rf1,
              ...rf2,
              ...rf3,
              ...rf4,
              ...rf5
            ];

            total_items = combine_items.length;
            if (extras) {
              if (typeof extras != "string") {
                extras = extras;
              } else {
                extras = JSON.parse(extras);
              }

              if (!extras || !extras.items) {
                return res.status(400).json({
                  status: "false",
                  message: "Wrong data"
                });
              }

              let item_array = extras.items;

              for (i = 0; i < item_array.length; i++) {
                count = item_array[i].count;
                await List_item.findOne({
                  where: {
                    id: item_array[i].id
                  }
                })
                  .then(item_price => {
                    total_price += item_price.price * count;
                  })
                  .catch(err => {
                    return res.status(400).json({
                      status: "false",
                      error: err,
                      message: "Failure"
                    });
                  });
              }
            }

            if (!package_id) {
              total_package = 0;
            } else {
              await Package.findOne({
                where: {
                  id: package_id
                }
              })
                .then(package => {
                  if (!package) {
                    return res.status(400).json({
                      status: "false",
                      message: "Failure"
                    });
                  } else {
                    total_package = 1;
                    total_price += package.price;
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
            if (total_price == 0) {
              await User.findOne({
                where: { id: user_id }
              })
                .then(user => {
                  if (user.claim_freeNail != 0) {
                    free_nail = true;
                  } else {
                    free_nail = false;
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
              free_nail = false;
            }
            if (free_nail == true) {
              return res.status(400).json({
                status: "false",
                message: "Free nail claimed already!"
              });
            } else {
              Cart.findOne({
                where: {
                  userId: user_id,
                  status: 1
                }
              })
                .then(active_cart => {
                  if (active_cart) {
                    if (total_price == 0) {
                      Cart_item.findOne({
                        where: { cartId: active_cart.id, price: 0 }
                      })
                        .then(free_package => {
                          if (free_package) {
                            return res.status(400).json({
                              status: "false",
                              message: "Free package already added"
                            });
                          } else {
                            Cart_item.create({
                              lf1: lf1,
                              lf2: lf2,
                              lf3: lf3,
                              lf4: lf4,
                              lf5: lf5,
                              rf1: rf1,
                              rf2: rf2,
                              rf3: rf3,
                              rf4: rf4,
                              rf5: rf5,
                              preview_image: preview,
                              price: total_price,
                              cartId: active_cart.id,
                              packageId: package_id
                            })
                              .then(cart_item => {
                                if (!cart_item) {
                                  return res.status(400).json({
                                    status: "false",
                                    message: "Failure"
                                  });
                                } else {
                                  total_price += active_cart.totalPrice;
                                  total_items += active_cart.totalItems;
                                  total_package += active_cart.totalPackage;

                                  Cart.update(
                                    {
                                      totalPrice: total_price,
                                      totalPackage: total_package,
                                      totalItems: total_items
                                    },
                                    {
                                      where: {
                                        id: active_cart.id
                                      }
                                    }
                                  )
                                    .then(cart_update => {
                                      return res.status(200).json({
                                        status: "true",
                                        message: "Items added to cart",
                                        cart_id: active_cart.id,
                                        cart_item_id: cart_item.id
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
                        })
                        .catch(err => {
                          return res.status(400).json({
                            status: "false",
                            error: err,
                            message: "Failure"
                          });
                        });
                    } else {
                      Cart_item.create({
                        lf1: lf1,
                        lf2: lf2,
                        lf3: lf3,
                        lf4: lf4,
                        lf5: lf5,
                        rf1: rf1,
                        rf2: rf2,
                        rf3: rf3,
                        rf4: rf4,
                        rf5: rf5,
                        preview_image: preview,
                        price: total_price,
                        cartId: active_cart.id,
                        packageId: package_id
                      })
                        .then(cart_item => {
                          if (!cart_item) {
                            return res.status(400).json({
                              status: "false",
                              message: "Failure"
                            });
                          } else {
                            total_price += active_cart.totalPrice;
                            total_items += active_cart.totalItems;
                            total_package += active_cart.totalPackage;

                            Cart.update(
                              {
                                totalPrice: total_price,
                                totalPackage: total_package,
                                totalItems: total_items
                              },
                              {
                                where: {
                                  id: active_cart.id
                                }
                              }
                            )
                              .then(cart_update => {
                                return res.status(200).json({
                                  status: "true",
                                  message: "Items added to cart",
                                  cart_id: active_cart.id,
                                  cart_item_id: cart_item.id
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
                    Cart.create({
                      status: 1,
                      totalPrice: total_price,
                      totalPackage: total_package,
                      totalItems: total_items,
                      userId: user_id
                    })
                      .then(new_cart => {
                        if (!new_cart) {
                          return res.status(400).json({
                            status: "false",
                            message: "Failure"
                          });
                        } else {
                          Cart_item.create({
                            lf1: lf1,
                            lf2: lf2,
                            lf3: lf3,
                            lf4: lf4,
                            lf5: lf5,
                            rf1: rf1,
                            rf2: rf2,
                            rf3: rf3,
                            rf4: rf4,
                            rf5: rf5,
                            price: total_price,
                            preview_image: preview,
                            cartId: new_cart.id,
                            packageId: package_id
                          })
                            .then(new_cartItem => {
                              if (!new_cartItem) {
                                return res.status(400).json({
                                  status: "false",
                                  message: "Failure"
                                });
                              } else {
                                return res.status(200).json({
                                  status: "true",
                                  message: "Items added to cart",
                                  cart_id: new_cart.id,
                                  cart_item_id: new_cartItem.id
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
