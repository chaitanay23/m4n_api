const formidable = require("formidable");
const Finger = require("../../models/finger-size");
const Order = require("../../models/order");
const jwt = require("../jwt");
const redis = require("../redis");

exports.update_size = (req, res) => {
  redis.authenticateToken(req.headers.authorization, result => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, (err, fields, files) => {
          if (err) {
            return res.status(500).json({
              status: "false",
              message: "Error",
              error: err
            });
          }

          var user_id = fields["user_id"];
          var lf1 = fields["L1"];
          var lf2 = fields["L2"];
          var lf3 = fields["L3"];
          var lf4 = fields["L4"]; //1st finger index finger
          var lf5 = fields["LT"]; //thumb left
          var rf1 = fields["R1"];
          var rf2 = fields["R2"];
          var rf3 = fields["R3"];
          var rf4 = fields["R4"]; //last finger
          var rf5 = fields["RT"]; //thumb right
          var comment = fields["comment"];

          if (user_id) {
            if (
              (lf1 ||
                lf2 ||
                lf3 ||
                lf4 ||
                lf5 ||
                rf1 ||
                rf2 ||
                rf3 ||
                rf4 ||
                rf5) &&
              comment
            ) {
              Finger.findOne({
                where: {
                  userId: user_id
                }
              })
                .then(old_finger => {
                  if (!old_finger) {
                    return res.status(400).json({
                      status: "false",
                      message: "no data found"
                    });
                  } else {
                    Finger.update(
                      {
                        lf1: lf1,
                        lf2: lf2,
                        lf3: lf3,
                        lf4: lf4,
                        lf5: lf5,
                        rf1: rf1,
                        rf2: rf2,
                        rf3: rf3,
                        rf4: rf4,
                        rf5: rf5,
                        comment: comment
                      },
                      {
                        where: {
                          userId: user_id
                        }
                      }
                    )
                      .then(update_finger => {
                        if (update_finger > 0) {
                          return res.status(200).json({
                            status: "true",
                            message: "Finger size updated"
                          });
                        } else {
                          return res.status(400).json({
                            status: "false",
                            message: "Unable to update finger sizes"
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
                })
                .catch(err => {
                  return res.status(400).json({
                    status: "false",
                    error: err,
                    message: "Failure"
                  });
                });
            } else {
              return res.status(400).json({
                status: "false",
                message: "Please provide all sizes"
              });
            }
          } else {
            return res.status(400).json({
              status: "false",
              message: "Please provide user"
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
