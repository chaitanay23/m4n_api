const Version = require("../../models/version");

exports.getVersion = (_, res) => {
  Version.findAll({
    where: { status: 1 }
  })
    .then(live_version => {
      return res.status(201).json({
        status: "true",
        message: "Current version",
        version: live_version
      });
    })
    .catch(err => {
      return res.json({
        status: "false",
        message: "Failure"
      });
    });
};
