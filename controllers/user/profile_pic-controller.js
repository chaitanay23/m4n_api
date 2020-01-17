var User = require("../../models/users");
const formidable = require("formidable");
const jwt = require("../jwt");
const redis = require("../redis");
var path = require("path");
const fs = require("fs");

module.exports.pic_update = function(req, res) {
  redis.authenticateToken(req.headers.authorization, result => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, (err, fields, files) => {
          if (err) {
            console.error("Error", err);
            throw err;
          }

          function profileUpload(image) {
            if (image != null) {
              if (image.type == "image/jpeg" || "image/png") {
                var extention = path.extname(image.name);
                var old_path = image.path;
                var new_path = "./profile_pic/pic_" + user_id + extention;
                fs.rename(old_path, new_path, err => {
                  if (err) throw err;
                  else console.log("Successfully moved");
                });
                db_path = new_path.slice(1, new_path.length);

                return db_path;
              }
            }
          }

          const user_id = jwt_result;
          const profile_pic = profileUpload(files.profile_pic);

          User.update(
            {
              profile_pic: profile_pic
            },
            {
              where: {
                id: user_id
              }
            }
          )
            .then(pic_upload => {
              if (pic_upload != 0) {
                return res.status(200).json({
                  status: "true",
                  message: "Profile pic updated"
                });
              } else {
                return res.status(400).json({
                  status: "false",
                  message: "Not updated"
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
