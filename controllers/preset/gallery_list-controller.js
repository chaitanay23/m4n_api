const formidable = require("formidable");
const Preset = require("../../models/preset");
const jwt = require("../jwt");
const redis = require("../redis");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const Package = require("../../models/package");

exports.preset_list = (req, res) => {
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

          Preset.findAll({
            where: {
              packageId: package_id
            },
            attributes: ["name", "image", "id", "packageId"],
            include: [
              {
                model: Package,
                attributes: ["price", "id"]
              }
            ]
          })
            .then(list => {
              if (list.length == 0) {
                return res.status(400).json({
                  status: "false",
                  message: "No item found"
                });
              } else {
                return res.status(200).json({
                  status: "true",
                  message: "Item list",
                  list: list
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
