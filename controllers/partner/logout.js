const jwt = require("../jwt");
const formidable = require("formidable");
const redis = require("../redis");

module.exports.logoutPartner = function(req, res) {
  redis.authenticateToken(req.headers.authorization, result => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, (err, fields) => {
          if (err) {
            console.error("Error", err);
            res.status(400).json({ status: 400, message: "Unable to logout" });
          }

          redis.addToBlacklist(req.headers.authorization);
          res.status(200).json({ status: 200, message: "Logout successfully" });
        });
      } else {
        return res
          .status(400)
          .json({ status: 400, message: "Token not verified" });
      }
    } else {
      return res
        .status(400)
        .json({ status: 400, message: "User not Logged In" });
    }
  });
};
