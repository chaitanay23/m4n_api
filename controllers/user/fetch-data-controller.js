const Cryptr = require("cryptr");
cryptr = new Cryptr("myTotalySecretKey");
const formidable = require("formidable");
const User = require("../../models/users");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const jwt = require("../jwt");
const redis = require("../redis");

exports.fetch = (req, res) => {
  redis.authenticateToken(req.headers.authorization, result => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, (err, fields) => {
          if (err) {
            console.error("Error", err);
            throw err;
          }
          //Fetch user-id
          const user_id = jwt_result;

          //Search Information corrs
          User.findOne({
            attributes: [
              "id",
              "name",
              "email",
              "mobileNumber",
              "DOB",
              "specialDate",
              "profile_pic",
              "referal_code"
            ],
            where: {
              id: user_id
            }
          })
            .then(user => {
              if (user == null) {
                return res.status(400).json({
                  message: "Invalid User Id"
                });
              } else {
                return res.status(200).json({
                  status: "true",
                  message: "Success",
                  user
                });
              }
            })
            .catch(error => {
              return res.status(400).json({
                status: "false",
                error: error
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
