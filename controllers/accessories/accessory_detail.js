const formidable = require("formidable");
const Accessories = require("../../models/accessories");
const Op = require("sequelize").Op;
const jwt = require("../jwt");
const redis = require("../redis");

exports.nail_kit = (req, res) => {
  redis.authenticateToken(req.headers.authorization, result => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, (err, fields) => {
          if (err) {
            res.json({
              status: "false",
              Error: err
            });
          }
        });

        const accessory_id = fields["kit_id"];

        Accessories.findOne({
          where: { id: accessory_id, flag: 1 }
        })
          .then(kit_detail => {
            if (kit_detail) {
              return res.status(200).json({
                status: "true",
                message: "Nail kit detail",
                accessories_detail: kit_detail
              });
            }
          })
          .catch(err => {
            return res.json({
              status: "false",
              message: "Failure"
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
