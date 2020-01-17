const jwt = require("../jwt");
const formidable = require("formidable");
const redis = require("../redis");

module.exports.logout = function(req, res) {
  redis.authenticateToken(req.headers.authorization, result => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, (err, fields) => {
          if (err) {
            return res.status(500).json({
              status: "false",
              message: "Unable to logout"
            });
          }

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
