const formidable = require("formidable");
const jwt = require("../jwt");
const redis = require("../redis");
const User = require("../../models/users");
const sequelize = require("sequelize");

exports.add_wishlist = (req, res) => {
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
          var list_itemId = fields["item_id"];
          list_itemId = parseInt(list_itemId);

          User.findOne({
            where: {
              id: user_id
            }
          })
            .then(user => {
              if (!user) {
                return res.status(400).json({
                  status: "false",
                  message: "No item found"
                });
              } else {
                if (!user.fav_item) {
                  raw_query = "select first_fav(?,?)";
                  User.sequelize
                    .query(raw_query, {
                      type: sequelize.QueryTypes.SELECT,
                      replacements: [user_id, list_itemId]
                    })
                    .catch(err => {
                      return res.status(400).json({
                        status: "false",
                        error: err,
                        message: "Failure"
                      });
                    });

                  return res.status(200).json({
                    status: "true",
                    message: "Item added to wishlist"
                  });
                } else {
                  let item_list = user.fav_item["items"];
                  if (item_list.includes(list_itemId)) {
                    let index = item_list.indexOf(list_itemId);
                    raw_query = "select rem_fav(?,?)";
                    User.sequelize
                      .query(raw_query, {
                        type: sequelize.QueryTypes.SELECT,
                        replacements: [user_id, index]
                      })
                      .catch(err => {
                        return res.status(400).json({
                          status: "false",
                          error: err,
                          message: "Failure"
                        });
                      });

                    return res.status(200).json({
                      status: "true",
                      message: "Item removed to wishlist"
                    });
                  } else {
                    raw_query = "select add_fav(?,?)";
                    User.sequelize
                      .query(raw_query, {
                        type: sequelize.QueryTypes.SELECT,
                        replacements: [user_id, list_itemId]
                      })
                      .catch(err => {
                        return res.status(400).json({
                          status: "false",
                          error: err,
                          message: "Failure"
                        });
                      });
                    return res.status(200).json({
                      status: "true",
                      message: "Item added to wishlist"
                    });
                  }
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
