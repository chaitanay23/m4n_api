const formidable = require("formidable");
const Hand = require("../../models/hand-image");
const fs = require("fs");
var path = require("path");
const Finger = require("../../models/finger-size");
const jwt = require("../jwt");
const redis = require("../redis");
//this api is not in use by android and ios as new technology introduce so on that basis we dont need to save user hand images
exports.upload_image = (req, res) => {
  redis.authenticateToken(req.headers.authorization, result => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, (err, fields, files) => {
          if (err) {
            console.error("Error", err);
            throw err;
          }

          var user_id = jwt_result;

          //Uploading Images
          left_hand = handUpload(
            files.left_hand,
            (type = "left_hand"),
            user_id
          );
          left_thumb = handUpload(
            files.left_thumb,
            (type = "left_thumb"),
            user_id
          );
          right_hand = handUpload(
            files.right_hand,
            (type = "right_hand"),
            user_id
          );
          right_thumb = handUpload(
            files.right_thumb,
            (type = "right_thumb"),
            user_id
          );

          if (
            left_hand == undefined &&
            left_thumb == undefined &&
            right_hand == undefined &&
            right_thumb == undefined
          ) {
            return res.status(404).json({
              status: "false",
              message: "No Image Files found"
            });
          } else {
            Hand.findOne({
              where: {
                userId: user_id
              }
            })
              .then(result => {
                if (result) {
                  Finger.update(
                    {
                      lf1: 0,
                      lf2: 0,
                      lf3: 0,
                      lf4: 0,
                      lf5: 0,
                      rf1: 0,
                      rf2: 0,
                      rf3: 0,
                      rf4: 0,
                      rf5: 0
                    },
                    {
                      where: {
                        userId: user_id
                      }
                    }
                  ).catch(err => {
                    return res.status(400).json({
                      status: "false",
                      message: "Failure",
                      error: err
                    });
                  });

                  Hand.update(
                    {
                      left_hand_image: left_hand,
                      right_hand_image: right_hand,
                      left_thumb_image: left_thumb,
                      right_thumb_image: right_thumb,
                      merged_image: null
                    },
                    {
                      where: {
                        userId: user_id
                      }
                    }
                  )
                    .then(update => {
                      if (update) {
                        return res.status(200).json({
                          status: "true",
                          message: "Hand images updated successfully"
                        });
                      } else {
                        return res.status(400).json({
                          status: "false",
                          message: "Error updating images"
                        });
                      }
                    })
                    .catch(err => {
                      return res.status(400).json({
                        error: err
                      });
                    });
                } else {
                  Hand.create({
                    userId: user_id,
                    left_hand_image: left_hand,
                    right_hand_image: right_hand,
                    left_thumb_image: left_thumb,
                    right_thumb_image: right_thumb
                  })
                    .then(create => {
                      if (create) {
                        return res.status(200).json({
                          status: "true",
                          message: "Hand images uploaded successfully"
                        });
                      } else {
                        return res.status(400).json({
                          status: "false",
                          message: "Error uploding images"
                        });
                      }
                    })
                    .catch(err => {
                      return res.status(400).json({
                        status: "false",
                        error: err
                      });
                    });
                }
              })
              .catch(err => {
                return res.status(400).json({
                  status: "false",
                  error: err
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

function handUpload(image, type, user_id) {
  if (image != null) {
    if (image.type == "image/jpeg" || "image/png" || "image/pdf") {
      var extention = path.extname(image.name);
      var old_path = image.path;
      var new_path = "./hand-uploads/" + type + "_" + user_id + extention;
      fs.rename(old_path, new_path, err => {
        if (err) throw err;
        else console.log("Successfully moved");
      });
      db_path = new_path.slice(1, new_path.length);

      return db_path;
    }
  }
}
