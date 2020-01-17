const formidable = require("formidable");
const User = require("../../models/users");
const sms = require("../sms");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

exports.otp_send = (req, res) => {
  new formidable.IncomingForm().parse(req, (err, fields) => {
    if (err) {
      console.error("Error", err);
      throw err;
    }

    const otp = sms.generate(6);
    const mobile = fields["mobile"];

    var sms_message =
      "Hi! " +
      otp +
      " is your MadForNails mobile verification code.\nThis code will expire in 30 minutes.";

    if (mobile) {
      User.findOne({
        where: {
          mobileNumber: mobile,
          password: {
            [Op.ne]: null
          }
        }
      }).then(user => {
        if (user) {
          User.update(
            {
              otp: otp
            },
            {
              where: {
                mobileNumber: mobile
              }
            }
          )
            .then(result => {
              if (result > 0) {
                sms.sendSMS(sms_message, mobile);

                return res.status(200).json({
                  status: "true",
                  message: "OTP sent"
                });
              }
            })
            .catch(err => {
              return res.status(404).json({
                status: "false",
                message: "Failure",
                error: err
              });
            });
        } else {
          return res.status(400).json({
            status: "false",
            message: "User not found"
          });
        }
      });
    } else {
      return res.status(400).json({
        status: "false",
        message: "Please provide mobile number"
      });
    }
  });
};
