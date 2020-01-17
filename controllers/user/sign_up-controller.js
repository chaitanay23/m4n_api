const Cryptr = require("cryptr");
cryptr = new Cryptr("myTotalySecretKey");
const formidable = require("formidable");
const User = require("../../models/users");
const sequelize = require("sequelize");
const sms = require("../sms");
const jwt = require("../jwt");

exports.signup = (req, res) => {
  function referal(string) {
    let name = string;
    result = name.slice(0, 4).toUpperCase();
    result = result.concat(sms.generate(6));

    return result;
  }

  new formidable.IncomingForm().parse(req, (err, fields) => {
    if (err) {
      console.error("Error", err);
      throw err;
    }

    let encryptedString;
    const password = fields["password"];
    if (password) {
      encryptedString = cryptr.encrypt(password);
    } else {
      return res.status(400).json({
        status: "false",
        message: "Please provide password"
      });
    }
    const mobile = fields["mobile"];
    const email = fields["email"];
    const name = fields["name"];
    const referee = fields["referee"];
    const referal_code = referal(name);
    let token;

    if (mobile && mobile.length === 10) {
      User.findOne({
        where: {
          mobileNumber: mobile
        }
      })
        .then(user => {
          token = jwt.jwt_generator(user.id);
        })
        .catch(err => {
          return res.status(400).json({
            status: "false",
            message: "Failure",
            error: err
          });
        });

      User.update(
        {
          name: name,
          email: email,
          password: encryptedString,
          referal_code: referal_code,
          referee: referee
        },
        {
          where: {
            mobileNumber: mobile
          }
        }
      )
        .then(user_update => {
          if (user_update > 0) {
            if (referee) {
              User.findOne({
                where: { referal_code: referee }
              }).then(refer_user => {
                if (refer_user) {
                  User.update(
                    {
                      referal_count: sequelize.literal("referal_count + 1")
                    },
                    { where: { id: refer_user.id } }
                  );
                }
              });
            }
            return res
              .status(200)
              .header("Authorization", token)
              .json({
                status: "true",
                message: "User registered sucessfully",
                name: name
              });
          } else {
            return res.status(400).json({
              status: "false",
              message: "Failure"
            });
          }
        })
        .catch(err => {
          return res.status(400).json({
            status: "false",
            message: "Failure",
            error: err
          });
        });
    } else {
      return res.status(400).json({
        status: "false",
        message: "Failure"
      });
    }
  });
};
