const formidable = require("formidable");
const User = require("../../models/users");

exports.showUser = (req, res) => {
  new formidable.IncomingForm().parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error", err);
      throw err;
    }

    const kiosk_user = fields["kiosk_user"];
    User.findAll({ where: { kioskUserId: kiosk_user } })
      .then(user_list => {
        if (user_list) {
          return res.send(
            JSON.stringify({
              status: "true",
              message: "list of users created by you kiosk",
              list: user_list
            })
          );
        } else {
          return res.send(
            JSON.stringify({
              status: "false",
              message: "no user found with your kiosk"
            })
          );
        }
      })
      .catch(err => {
        return res.send(JSON.stringify({ status: "false", error: err }));
      });
  });
};
