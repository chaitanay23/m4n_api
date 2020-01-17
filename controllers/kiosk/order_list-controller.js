const formidable = require("formidable");
const Order = require("../../models/order");

module.exports.orders = function(req, res) {
  new formidable.IncomingForm().parse(req, (err, fields) => {
    if (err) {
      console.error("Error", err);
      throw err;
    }
    const kiosk_id = fields["kiosk_id"];

    if (kiosk_id) {
      Order.findAll({ where: { kioskUserId: kiosk_id } })
        .then(kiosk_order => {
          if (kiosk_order) {
            return res.send(
              JSON.stringify({
                status: "true",
                message: "list of orders",
                orders: kiosk_order
              })
            );
          } else {
            return res.send(
              JSON.stringify({ status: "false", message: "no order found" })
            );
          }
        })
        .catch(err => {
          return res.send(JSON.stringify({ error: err }));
        });
    } else {
      return res.send(
        JSON.stringify({ status: "false", message: "please provide kiosk id" })
      );
    }
  });
};
