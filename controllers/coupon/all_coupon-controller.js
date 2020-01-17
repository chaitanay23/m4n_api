const formidable = require("formidable");
const Coupon = require("../../models/coupon");
const jwt = require("../jwt");
const redis = require("../redis");

module.exports.all_coupon = function(req, res) {
  redis.authenticateToken(req.headers.authorization, result => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, (err, fields) => {
          if (err) {
            console.error("Error", err);
            throw err;
          }
          Coupon.findAll({
            where: {
              flag: 1,
              visible: 1
            }
          })
            .then(coupon => {
              if (coupon != null) {
                return res.status(200).json({
                  status: "true",
                  message: "List of coupons",
                  coupon_list: coupon
                });
              } else {
                return res.status(400).json({
                  status: "false",
                  message: "No coupon found"
                });
              }
            })
            .catch(err => {
              return res.status(400).json({
                status: "false",
                error: err
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
