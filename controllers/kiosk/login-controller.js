const formidable = require("formidable");
const Kiosk = require("../../models/kioskUser");
const bcrypt = require("bcryptjs");

module.exports.authenticate = function(req, res) {
  new formidable.IncomingForm().parse(req, (err, fields) => {
    if (err) {
      console.error("Error", err);
      throw err;
    }
    var email = fields["email"];
    var password = fields["password"];
    Kiosk.findOne({ where: { email: email } })
      .then(kiosk_user => {
        if (kiosk_user != null) {
          hashPassword = kiosk_user.password;
          bcrypt
            .compare(password, hashPassword)
            .then(user_match => {
              if (user_match) {
                return res.send(
                  JSON.stringify({
                    status: "true",
                    message: "User logged in",
                    kiosk_user: kiosk_user
                  })
                );
              } else {
                return res.send(
                  JSON.stringify({
                    status: "false",
                    message: "Enter valid credentials"
                  })
                );
              }
            })
            .catch(err => {
              return res.send(JSON.stringify({ error: err }));
            });
        } else {
          return res.send(
            JSON.stringify({
              status: "false",
              message: "Enter valid credentials"
            })
          );
        }
      })
      .catch(err => {
        return res.send(JSON.stringify({ error: err }));
      });
  });
};
