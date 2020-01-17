const formidable = require("formidable");
const jwt = require("../jwt");
const redis = require("../redis");
const User = require("../../models/users");
const sequelize = require("sequelize");
const Op = sequelize.Op;
const List_item = require("../../models/list_item");

exports.show_wishlist = (req, res) => {
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
          User.findOne({
            where: {
              id: user_id,
              fav_item: {
                [Op.ne]: null
              }
            }
          }).then(user_wish => {
            if (!user_wish) {
              return res.status(400).json({
                status: "false",
                message: "No wishlisted item found"
              });
            } else {
              let item_array = user_wish.fav_item["items"];
              List_item.findAll({
                where: {
                  id: {
                    [Op.in]: item_array
                  }
                }
              })
                .then(wish => {
                  if (!wish) {
                    return res.status(400).json({
                      status: "false",
                      message: "No item found"
                    });
                  } else {
                    return res.status(200).json({
                      status: "true",
                      message: "Wishlisted items",
                      wishlist: wish
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
