const bcrypt = require("bcryptjs");
const Partner = require("../../models/partner");
const formidable = require("formidable");
const jwt = require("../jwt");

module.exports.login = (req, res) => {
  new formidable.IncomingForm().parse(req, (err, fields) => {
    const mobile = fields["mobile"];
    const password = fields["password"];
    const pattern = /\d{10}/;
    let token;

    if (pattern.test(mobile) != true) {
      res.status(406).json({
        message: "Not a valid mobile number",
        status: 406
      });
    } else {
      Partner.findOne({
        where: {
          mobile
        }
      })
        .then(user => {
          token = jwt.jwt_generator(user.id);

          // We will be using 12 rounds to encrypt
          bcrypt.compare(password, user.password).then(result => {
            result == true
              ? res
                  .status(200)
                  .header("Authorization", token)
                  .json({
                    message: "Login Successfull",
                    Authorization: token,
                    status: 200
                  })
              : res.status(401).json({
                  message: "Invalid Credentials",
                  status: 401
                });
          });
        })
        .catch(() =>
          res.status(400).json({
            message: "Partner not found",
            status: 400
          })
        );
    }
  });
};
