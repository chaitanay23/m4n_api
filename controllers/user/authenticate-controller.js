const formidable = require("formidable");
const User = require("../../models/users");
const jwt = require("../jwt");

module.exports.authenticate = function(req, res) {
  new formidable.IncomingForm().parse(req, (err, fields) => {
    if (err) {
      return res.status(404).json({
        status: "false",
        message: "Failure",
        error: error
      });
    }

    const mobile = fields["mobile"];
    const password = fields["password"];
    User.findOne({
      where: {
        mobileNumber: mobile
      }
    })
      .then(user => {
        if (user) {
          const old_password = user.password;
          const user_id = user.id;
          decryptedString = cryptr.decrypt(old_password);
          if (password == decryptedString) {
            const token = jwt.jwt_generator(user_id);
            return res
              .status(200)
              .header("Authorization", token)
              .json({
                status: "true",
                message: "Successfully authenticated",
                name: user.name
              });
          } else {
            return res.status(400).json({
              status: "false",
              message: "Invalid Credentials"
            });
          }
        } else {
          return res.status(400).json({
            status: "false",
            message: "Failure"
          });
        }
      })
      .catch(error => {
        return res.status(404).json({
          status: "false",
          message: "Failure",
          error: error
        });
      });
  });
};
