const formidable = require("formidable");
const Sale = require("../../models/sale");
const Partner = require("../../models/partner");
const Order = require("../../models/order");
const sequelize = require("sequelize");
const Op = sequelize.Op;
const Address = require("../../models/address");
const jwt = require("../jwt");
const redis = require("../redis");

module.exports.pincode = (req, res) => {
  redis.authenticateToken(req.headers.authorization, result => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, (err, fields) => {
          const partnerId = jwt_result;
          let dictionary = [];
          let orderArr = [];
          let dictValues = [];
          let dict = {};

          Partner.findOne({
            where: {
              id: partnerId
            },
            attributes: [],
            include: [
              {
                model: Sale,
                attributes: ["orderId"]
              }
            ]
          })
            .then(partner => {
              if (partner) {
                partner.sales.forEach(val => orderArr.push(val.orderId));
                Order.findAll({
                  where: {
                    id: { [Op.in]: orderArr }
                  },
                  attributes: [],
                  include: [
                    {
                      model: Address,
                      attributes: ["zipcode"]
                    }
                  ]
                })
                  .then(zipcodes => {
                    for (
                      let i = 0, j = 0;
                      i < zipcodes.length;
                      j = j + 2, i++
                    ) {
                      if (
                        dictionary.length == 0 ||
                        !dictionary.includes(zipcodes[i].address.zipcode) ==
                          true
                      ) {
                        dictionary[j] = zipcodes[i].address.zipcode;
                        dictionary[j + 1] = 1;
                      } else {
                        if (
                          dictionary.includes(zipcodes[i].address.zipcode) ==
                          true
                        ) {
                          dictionary[
                            dictionary.indexOf(zipcodes[i].address.zipcode) + 1
                          ] += 1;
                          j = j - 2;
                        }
                      }
                    }
                    for (let i = 0; i < dictionary.length; i = i + 2) {
                      dictValues.push({
                        pincode: dictionary[i],
                        count: dictionary[i + 1]
                      });
                    }
                    res.status(200).json({
                      Dictionary: (dict = { dictValues }),
                      total_pincodes: dictValues.length,
                      status: 200
                    });
                  })
                  .catch(() => {
                    res.status(203).json({
                      message: "No Zipcodes found",
                      status: 203
                    });
                  });
              } else {
                res.status(203).json({
                  message: "Partner not found",
                  status: 203
                });
              }
            })
            .catch(() => {
              res.status(400).json({
                message: "Please provide partner id",
                status: 400
              });
            });
        });
      } else {
        res.status(400).json({
          status: 400,
          message: "Token not verified"
        });
      }
    } else {
      res.status(400).json({
        status: 400,
        message: "Partner not Logged In"
      });
    }
  });
};
