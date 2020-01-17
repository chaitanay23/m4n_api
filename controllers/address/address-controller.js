const formidable = require("formidable");
const Address = require("../../models/address");
const jwt = require("../jwt");
const redis = require("../redis");

exports.user_address = (req, res) => {
  redis.authenticateToken(req.headers.authorization, result => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, (err, fields, files) => {
          if (err) {
            console.error("Error", err);
            throw err;
          }

          var user_id = jwt_result;
          var name = fields["name"];
          var mobile = fields["mobile"];
          var type = fields["type"];
          var state = fields["state"];
          var city = fields["city"];
          var area = fields["area"];
          var address = fields["address"];
          var zipcode = fields["zipcode"];

          if (
            user_id &&
            name &&
            mobile &&
            state &&
            city &&
            zipcode &&
            type &&
            area &&
            address != null
          ) {
            Address.create({
              userId: user_id,
              name: name,
              mobile: mobile,
              type: type,
              state: state,
              city: city,
              area: area,
              zipcode: zipcode,
              address: address
            })
              .then(address => {
                return res.status(200).json({
                  status: "true",
                  message: "User address added sucessfully",
                  address_id: address.id
                });
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
              message: "Please provide correct details for address"
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
