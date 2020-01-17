const formidable = require("formidable");
const Design = require("../../models/design-image");
const fs = require("fs");
var path = require("path");
const jwt = require("../jwt");
const redis = require("../redis");

exports.design_image = (req, res) => {
  redis.authenticateToken(req.headers.authorization, result => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, (err, fields, files) => {
          if (err) {
            console.error("Error", err);
            throw err;
          }

          function designUpload(image, type) {
            if (image != null) {
              if (image.type == "image/jpeg" || "image/png") {
                var extention = path.extname(image.name);
                var old_path = image.path;
                var new_path =
                  "./design-uploads/" +
                  type +
                  "_" +
                  user_id +
                  "_" +
                  cart_item_id +
                  extention;
                fs.rename(old_path, new_path, err => {
                  if (err) throw err;
                  else console.log("Successfully moved");
                });
                db_path = new_path.slice(1, new_path.length);

                return db_path;
              }
            }
          }

          var user_id = jwt_result;
          const cart_item_id = fields["cart_item_id"];
          let lf1 = designUpload(files.lf1, (type = "lf1"));
          let lf2 = designUpload(files.lf2, (type = "lf2"));
          let lf3 = designUpload(files.lf3, (type = "lf3"));
          let lf4 = designUpload(files.lf4, (type = "lf4"));
          let lf5 = designUpload(files.lf5, (type = "lf5"));
          let rf1 = designUpload(files.rf1, (type = "rf1"));
          let rf2 = designUpload(files.rf2, (type = "rf2"));
          let rf3 = designUpload(files.rf3, (type = "rf3"));
          let rf4 = designUpload(files.rf4, (type = "rf4"));
          let rf5 = designUpload(files.rf5, (type = "rf5"));
          if (
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
              cart_item_id
            )
          ) {
            return res.status(400).json({
              status: "false",
              message: "Provide complete data"
            });
          }
          Design.findOne({
            where: { userId: user_id, cartItemId: cart_item_id }
          }).then(design => {
            if (design) {
              Design.update(
                {
                  lf1: lf1,
                  lf2: lf2,
                  lf3: lf3,
                  lf4: lf4,
                  lf5: lf5,
                  rf1: rf1,
                  rf2: rf2,
                  rf3: rf3,
                  rf4: rf4,
                  rf5: rf5
                },
                { where: { id: design.id } }
              )
                .then(design_updated => {
                  if (!design_updated) {
                    return res.status(400).json({
                      status: "false",
                      message: "Failed to upload"
                    });
                  } else {
                    return res.status(200).json({
                      status: "true",
                      message: "Design images updated successfully",
                      final_image: design.id
                    });
                  }
                })
                .catch(err => {
                  return res.status(400).json({
                    status: "false",
                    message: "Failure",
                    error: err
                  });
                });
            } else {
              Design.create({
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
                userId: user_id,
                cartItemId: cart_item_id
              })
                .then(new_design => {
                  if (!new_design) {
                    return res.status(400).json({
                      status: "false",
                      message: "Error updating images"
                    });
                  } else {
                    return res.status(200).json({
                      status: "true",
                      message: "Design images updated successfully",
                      final_image: new_design.id
                    });
                  }
                })
                .catch(err => {
                  return res.status(400).json({
                    status: "false",
                    message: "Failure",
                    error: err
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
