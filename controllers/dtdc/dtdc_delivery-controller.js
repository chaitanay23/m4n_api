const formidable = require("formidable");
const Address = require("../../models/address");
const rp = require("request-promise");
const jwt = require("../jwt");
const redis = require("../redis");
const ENV = require("../../env");
const orignPin = ENV.ORIGINPIN;
const pincodeAPI = ENV.PINCODE_DTDC;

exports.check_delivery = (req, res) => {
  redis.authenticateToken(req.headers.authorization, result => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, (err, fields, files) => {
          if (err) {
            console.error("Error", err);
            throw err;
          }

          var address_id = fields["address_id"];

          Address.findOne({
            where: {
              id: address_id
            }
          })
            .then(address => {
              let orgPincode = orignPin;

              let desPincode = address.zipcode.toString();
              rp({
                method: "POST",

                json: true,
                url: pincodeAPI,

                body: {
                  orgPincode: orgPincode,
                  desPincode: desPincode
                }
              })
                .then(resp => {
                  resp.SERV_LIST[0].LITE_Serviceable == "YES"
                    ? res.json({
                        status: "true",
                        delivery: "true"
                      })
                    : res.json({
                        status: "true",
                        delivery: "false"
                      });
                })
                .catch(err =>
                  res.json({
                    status: "false",
                    message: "Failure",
                    error: err
                  })
                );
            })
            .catch(err =>
              res.json({
                status: "false",
                message: "Invalid Address ID"
              })
            );
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
