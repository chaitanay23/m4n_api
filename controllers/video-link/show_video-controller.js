const formidable = require("formidable");
const Video = require("../../models/video-link");
const jwt = require("../jwt");
const redis = require("../redis");

exports.getVideo = (req, res) => {
  redis.authenticateToken(req.headers.authorization, result => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, (err, fields, files) => {
          if (err) {
            console.error("Error", err);
            throw err;
          }
          Video.findAll()
            .then(video_link => {
              if (video_link) {
                return res.status(200).json({
                  status: "true",
                  message: "video link",
                  video: video_link
                });
              } else {
                return res
                  .status(400)
                  .json({ status: "false", message: "no video available" });
              }
            })
            .catch(err => {
              return res
                .status(400)
                .json({ status: "false", error: err, message: "Failure" });
            });
        });
      } else {
        return res
          .status(400)
          .json({ status: "false", message: "Token not verified" });
      }
    } else {
      return res
        .status(400)
        .json({ status: "false", message: "User not Logged In" });
    }
  });
};
