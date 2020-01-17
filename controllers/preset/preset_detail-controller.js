const formidable = require("formidable");
const Preset = require("../../models/preset");
const Package = require("../../models/package");
const jwt = require("../jwt");
const redis = require("../redis");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

exports.set_detail = (req, res) => {
  redis.authenticateToken(req.headers.authorization, result => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, (err, fields) => {
          if (err) {
            console.error("Error", err);
            throw err;
          }
          const user_id = jwt_result;
          const package_id = fields["package_id"];
          const preset_id = fields["preset_id"];
          if (!(preset_id && package_id)) {
            return res.status(400).json({
              status: "false",
              message: "Provide complete data"
            });
          } else {
            Preset.findOne({
              where: {
                id: preset_id,
                packageId: package_id
              },
              include: [
                {
                  model: Package,
                  attributes: ["id", "name", "price", "description"]
                }
              ]
            })
              .then(nail_set => {
                if (!nail_set) {
                  return res.status(400).json({
                    status: "false",
                    message: "No pre-set found"
                  });
                } else {
                  return res.status(200).json({
                    status: "true",
                    nail_set: nail_set
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
