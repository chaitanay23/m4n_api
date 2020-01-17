const formidable = require("formidable");
const ListItems = require("../../models/list_item");
const Finger = require("../../models/finger-size");
const Address = require("../../models/address");
const Package = require("../../models/package");
const Cart_item = require("../../models/cart-item");
const jwt = require("../jwt");
const redis = require("../redis");
const sequelize = require("sequelize");
const Op = sequelize.Op;

exports.jobCardA5 = (req, res) => {
  redis.authenticateToken(req.headers.authorization, result => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, (err, fields) => {
          if (err) {
            console.error("Error", err);
            throw err;
          }

          const cart_item = fields["cart_item_id"];
          const finger_id = fields["finger_id"];
          const address_id = fields["address_id"];
          if (!(cart_item && finger_id && address_id)) {
            return res.status(400).json({
              status: "false",
              message: "Provide complete details"
            });
          } else {
            Cart_item.findOne({
              where: { id: cart_item },
              include: [
                { model: Package, attributes: ["id", "name", "description"] }
              ]
            })
              .then(cart => {
                if (!cart.packageId) {
                  return res.status(200).json({
                    status: "false",
                    message: "No package contained"
                  });
                } else {
                  package_detail = cart.package;
                  lf1 = cart.lf1;
                  lf2 = cart.lf2;
                  lf3 = cart.lf3;
                  lf4 = cart.lf4;
                  lf5 = cart.lf5;
                  rf1 = cart.rf1;
                  rf2 = cart.rf2;
                  rf3 = cart.rf3;
                  rf4 = cart.rf4;
                  rf5 = cart.rf5;
                  items = [
                    ...lf1,
                    ...lf2,
                    ...lf3,
                    ...lf4,
                    ...lf5,
                    ...rf1,
                    ...rf2,
                    ...rf3,
                    ...rf4,
                    ...rf5
                  ];
                  dictionary = {};

                  dictionary["lf1"] = lf1;
                  dictionary["lf2"] = lf2;
                  dictionary["lf3"] = lf3;
                  dictionary["lf4"] = lf4;
                  dictionary["lf5"] = lf5;
                  dictionary["rf1"] = rf1;
                  dictionary["rf2"] = rf2;
                  dictionary["rf3"] = rf3;
                  dictionary["rf4"] = rf4;
                  dictionary["rf5"] = rf5;

                  left_hand = [];
                  right_hand = [];
                  left_design = [];
                  right_design = [];
                  var l_design_array = [];
                  var r_design_array = [];
                  final_key = {};
                  left_regex = /^l/;
                  right_regex = /^r/;
                  ListItems.findAll({
                    where: {
                      id: {
                        [Op.in]: items
                      }
                    },
                    attributes: ["id", "item_code", "type"]
                  }).then(item_detail => {
                    for (var att in dictionary) {
                      for (i = 0; i < item_detail.length; i++) {
                        dictionary[att].forEach(element => {
                          if (item_detail[i].id == element) {
                            final_key["type"] = item_detail[i].type;
                            final_key[att] = item_detail[i].item_code;
                            if (left_regex.test(att)) {
                              left_hand.push(final_key);
                            } else {
                              right_hand.push(final_key);
                            }
                            final_key = {};
                          }
                        });
                      }
                    }

                    left_type_array = [];
                    right_type_array = [];
                    for (l = 0; l < left_hand.length; l++) {
                      left_type_array.push(left_hand[l].type);
                    }
                    for (r = 0; r < right_hand.length; r++) {
                      right_type_array.push(right_hand[r].type);
                    }
                    left_type_set = new Set(left_type_array);
                    right_type_set = new Set(right_type_array);

                    // console.log(left_type_set, right_type_set);

                    for (let element of left_type_set) {
                      left_hand_design = {
                        type: "",
                        lf1: "",
                        lf2: "",
                        lf3: "",
                        lf4: "",
                        lf5: ""
                      };
                      left_hand_design.type = element;
                      l_design_array.push(left_hand_design);
                    }

                    for (let element of right_type_set) {
                      right_hand_design = {
                        type: "",
                        rf1: "",
                        rf2: "",
                        rf3: "",
                        rf4: "",
                        rf5: ""
                      };
                      right_hand_design.type = element;
                      r_design_array.push(right_hand_design);
                    }

                    for (lh = 0; lh < left_hand.length; lh++) {
                      for (ld = 0; ld < l_design_array.length; ld++) {
                        if (left_hand[lh].type == l_design_array[ld].type) {
                          if (left_hand[lh].lf1)
                            l_design_array[ld].lf1 = left_hand[lh].lf1;
                          if (left_hand[lh].lf2)
                            l_design_array[ld].lf2 = left_hand[lh].lf2;
                          if (left_hand[lh].lf3)
                            l_design_array[ld].lf3 = left_hand[lh].lf3;
                          if (left_hand[lh].lf4)
                            l_design_array[ld].lf4 = left_hand[lh].lf4;
                          if (left_hand[lh].lf5)
                            l_design_array[ld].lf5 = left_hand[lh].lf5;
                        }
                      }
                    }

                    for (rh = 0; rh < right_hand.length; rh++) {
                      for (rd = 0; rd < r_design_array.length; rd++) {
                        if (right_hand[rh].type == r_design_array[rd].type) {
                          if (right_hand[rh].rf1)
                            r_design_array[rd].rf1 = right_hand[rh].rf1;
                          if (right_hand[rh].rf2)
                            r_design_array[rd].rf2 = right_hand[rh].rf2;
                          if (right_hand[rh].rf3)
                            r_design_array[rd].rf3 = right_hand[rh].rf3;
                          if (right_hand[rh].rf4)
                            r_design_array[rd].rf4 = right_hand[rh].rf4;
                          if (right_hand[rh].rf5)
                            r_design_array[rd].rf5 = right_hand[rh].rf5;
                        }
                      }
                    }

                    Finger.findOne({
                      where: { id: finger_id }
                    })
                      .then(finger => {
                        if (!finger) {
                          return res.status(400).json({
                            status: "false",
                            message: "Finger sizes not found"
                          });
                        } else {
                          Address.findOne({
                            where: { id: address_id }
                          })
                            .then(address => {
                              if (!address) {
                                return res.status(400).json({
                                  status: "false",
                                  message: "Address not found"
                                });
                              } else {
                                return res.status(200).json({
                                  status: "true",
                                  message: "Package details",
                                  address: address,
                                  finger_size: finger,
                                  package_detail: package_detail,
                                  left_design: l_design_array,
                                  right_design: r_design_array
                                });
                              }
                            })
                            .catch(err => {
                              return res.status(400).json({
                                status: "false",
                                error: err,
                                message: "Failure1"
                              });
                            });
                        }
                      })
                      .catch(err => {
                        return res.status(400).json({
                          status: "false",
                          error: err,
                          message: "Failure2"
                        });
                      });
                  });
                }
              })
              .catch(err => {
                return res.status(400).json({
                  status: "false",
                  error: err,
                  message: "Failur3"
                });
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
