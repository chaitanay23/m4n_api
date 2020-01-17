const formidable = require("formidable");
const Package = require("../../models/package");
const ListItems = require("../../models/list_item");
const Op = require("sequelize").Op;
const User = require("../../models/users");
const jwt = require("../jwt");
const redis = require("../redis");

exports.package = (req, res) => {
  redis.authenticateToken(req.headers.authorization, result => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, (err, fields) => {
          if (err) {
            res.json({
              status: "false",
              Error: err
            });
          }

          var package_id = fields["package_id"];
          const user_id = jwt_result;
          if (package_id) {
            Package.findOne({
              attributes: [
                "id",
                "name",
                "price",
                "description",
                "colors",
                "customization",
                "fancy_nail_qty"
              ],
              where: {
                id: package_id,
                flag: 1
              }
            })
              .then(package => {
                if (package.price == 0) {
                  User.findOne({
                    where: { id: user_id }
                  })
                    .then(user => {
                      if (user.claim_freeNail != 0) {
                        return res.status(400).json({
                          status: "false",
                          message:
                            "You’ve already claimed your free nail.. Please check out other exciting offers on Snapons!!"
                        });
                      } else {
                        let color_arr = package.colors;
                        let items_arr = package.customization["list_items"];
                        let arr = [...color_arr.id, ...items_arr];

                        ListItems.findAll({
                          attributes: [
                            "id",
                            "title",
                            "price",
                            "item_code",
                            "type",
                            "imageUrl",
                            "brand_imageUrl",
                            "finger_limit",
                            "description"
                          ],
                          where: {
                            id: {
                              [Op.in]: arr
                            }
                          }
                        })
                          .then(items => {
                            let glitter = {
                              items: []
                            };
                            let pattern = {
                              items: []
                            };
                            let sticker = {
                              items: []
                            };
                            let jewellery = {
                              items: []
                            };
                            let color = {
                              items: []
                            };

                            items.forEach(item => {
                              if (
                                item.type == "color-gloss" ||
                                item.type == "color-matte"
                              ) {
                                color["items"].push(item);
                              } else if (item.type == "glitter") {
                                glitter["items"].push(item);
                              } else if (item.type == "sticker") {
                                sticker["items"].push(item);
                              } else if (item.type == "jewellery") {
                                jewellery["items"].push(item);
                              } else if (item.type == "pattern") {
                                pattern["items"].push(item);
                              }
                            });
                            package.colors = color;
                            package.customization.list_items = {
                              glitter,
                              sticker,
                              jewellery,
                              pattern
                            };

                            return res.json({
                              status: "true",
                              message: "Package details",
                              package
                            });
                          })
                          .catch(err =>
                            res.json({
                              status: "false",
                              message: err
                            })
                          );
                      }
                    })
                    .catch(error => {
                      return res.status(400).json({
                        status: "false",
                        error: error
                      });
                    });
                } else {
                  let color_arr = package.colors;
                  let items_arr = package.customization["list_items"];
                  let arr = [...color_arr.id, ...items_arr];

                  ListItems.findAll({
                    attributes: [
                      "id",
                      "title",
                      "price",
                      "item_code",
                      "type",
                      "imageUrl",
                      "brand_imageUrl",
                      "finger_limit",
                      "description"
                    ],
                    where: {
                      id: {
                        [Op.in]: arr
                      }
                    }
                  })
                    .then(items => {
                      let glitter = {
                        items: []
                      };
                      let pattern = {
                        items: []
                      };
                      let sticker = {
                        items: []
                      };
                      let jewellery = {
                        items: []
                      };
                      let color = {
                        items: []
                      };

                      items.forEach(item => {
                        if (
                          item.type == "color-gloss" ||
                          item.type == "color-matte"
                        ) {
                          color["items"].push(item);
                        } else if (item.type == "glitter") {
                          glitter["items"].push(item);
                        } else if (item.type == "sticker") {
                          sticker["items"].push(item);
                        } else if (item.type == "jewellery") {
                          jewellery["items"].push(item);
                        } else if (item.type == "pattern") {
                          pattern["items"].push(item);
                        }
                      });
                      package.colors = color;
                      package.customization.list_items = {
                        glitter,
                        sticker,
                        jewellery,
                        pattern
                      };

                      return res.json({
                        status: "true",
                        message: "Package details",
                        package
                      });
                    })
                    .catch(err =>
                      res.json({
                        status: "false",
                        message: err
                      })
                    );
                }
              })
              .catch(err =>
                res.json({
                  status: "false",
                  message: "Invalid Package Id"
                })
              );
          } else {
            return res.json({
              status: "false",
              message: "Please Enter Package Id"
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
