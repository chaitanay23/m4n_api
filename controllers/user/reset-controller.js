const formidable = require("formidable");
const User = require("../../models/users");
var Cryptr = require("cryptr");
cryptr = new Cryptr("myTotalySecretKey");
const jwt = require("../jwt");
const redis = require("../redis");

module.exports.reset = function(req, res) {
  new formidable.IncomingForm().parse(req, async (err, fields) => {
    if (err) {
      console.error("Error", err);
      throw err;
    }
    const mobile = fields["mobile"];
    const encryptedString = cryptr.encrypt(fields["password"]);

    if (mobile && encryptedString && mobile.length == 10) {
      const user_id = await User.findOne({
        where: {
          mobileNumber: mobile
        }
      });
      User.update(
        {
          password: encryptedString
        },
        {
          where: {
            id: user_id.id
          }
        }
      )
        .then(result => {
          if (result != 0) {
            const token = jwt.jwt_generator(user_id.id);
            return res
              .status(200)
              .header("Authorization", token)
              .json({
                status: "true",
                message: "User password updated sucessfully"
              });
          } else {
            return res.status(400).json({
              status: "false",
              message: "Wrong mobile number"
            });
          }
        })
        .catch(err => {
          return res.status(400).json({
            status: "false",
            error: err
          });
        });
    } else {
      return res.status(400).json({
        status: "false",
        message: "Please provide mobile number"
      });
    }
  });
};
