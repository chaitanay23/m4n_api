const formidable = require("formidable");
const Address = require("../../models/address");
const jwt = require("../jwt");
const redis = require("../redis");

exports.edit_address = (req, res) => {
  redis.authenticateToken(req.headers.authorization, result => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, (err, fields, files) => {
          if (err) {
            console.error("Error", err);
            throw err;
          }

          const id = fields["id"];
          const name = fields["name"];
          const mobile = fields["mobile"];
          const type = fields["type"];
          const state = fields["state"];
          const city = fields["city"];
          const area = fields["area"];
          const address = fields["address"];
          const zipcode = fields["zipcode"];

          if (
            id &&
            name &&
            mobile &&
            state &&
            city &&
            zipcode &&
            type &&
            area &&
            address != null
          ) {
            Address.update(
              {
                name: name,
                mobile: mobile,
                type: type,
                state: state,
                city: city,
                area: area,
                zipcode: zipcode,
                address: address
              },
              {
                where: {
                  id: id
                }
              }
            )
              .then(result => {
                if (result != 0) {
                  return res.status(200).json({
                    status: "true",
                    message: "Address updated sucessfully",
                    address_id: id
                  });
                } else {
                  return res.status(400).json({
                    status: "false",
                    message: "Address with given id not found"
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
