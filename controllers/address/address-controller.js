const formidable = require('formidable');
const Address = require('../../models/address');
const Store = require('../../models/store');
const jwt = require('../jwt');
const redis = require('../redis');

exports.user_address = (req, res) => {
  redis.authenticateToken(req.headers.authorization, (result) => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, async (err, fields, files) => {
          if (err) {
            console.error('Error', err)
            throw err
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
          let store_id;

          if (user_id && name && mobile && state && city && zipcode && type && area && address != null) {
            await Store.findOne({
                where: {
                  area: area
                }
              })
              .then(async store_area => {
                if (store_area) {
                  store_id = store_area.id;
                } else {
                  await Store.findOne({
                      where: {
                        zipcode: zipcode
                      }
                    })
                    .then(async store_zip => {
                      if (store_zip) {
                        store_id = store_zip.id;
                      } else {
                        await Store.findOne({
                            where: {
                              city: city
                            }
                          })
                          .then(async store_city => {
                            if (store_city) {
                              store_id = store_city.id;
                            } else {
                              await Store.findOne({
                                  where: {
                                    state: state
                                  }
                                })
                                .then(store_state => {
                                  if (store_state) {
                                    store_id = store_state.id;
                                  } else {
                                    store_id = null;
                                  }
                                })
                            }
                          })
                          .catch(err => {
                            return res.status(400).json({
                              status: "false",
                              error: err,
                              message:"Failure"
                            });
                          })
                      }
                    })
                    .catch(err => {
                      return res.status(400).json({
                        status: "false",
                        error: err,
                        message:"Failure"
                      });
                    })
                }
              })
              .catch(err => {
                return res.status(400).json({
                  status: "false",
                  error: err,
                  message:"Failure"
                });
              })

            Address.create({
                userId: user_id,
                name: name,
                mobile: mobile,
                type: type,
                state: state,
                city: city,
                area: area,
                zipcode: zipcode,
                address: address,
                storeId: store_id,
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
                  message:"Failure"
                });
              })
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
}