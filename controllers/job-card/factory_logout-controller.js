const jwt = require("../jwt");
const Factory = require("../../models/factory-user");
const formidable = require("formidable");
const redis = require("../redis");

module.exports.logout = function(req, res) {
  redis.authenticateToken(req.headers.authorization, result => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, (err, fields) => {
          if (err) {
            console.error("Error", err);
            return res.status(400).json({
              status: "false",
              message: "Unable to logout"
            });
          }

          const user_id = jwt_result;
          redis.addToBlacklist(req.headers.authorization);
          return res.status(200).json({
            status: "true",
            message: "Logout successfully"
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
