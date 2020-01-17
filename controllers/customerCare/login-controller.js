const formidable = require("formidable");
const CustomerCare = require("../../models/customer-care");
const jwt = require("../jwt");

module.exports.authenticate = function(req, res) {
  new formidable.IncomingForm().parse(req, (err, fields) => {
    if (err) {
      return res.status(500).json({
        status: "false",
        message: "Error",
        error: err
      });
    }

    const mobile = fields["mobile"];
    const password = fields["password"];
    CustomerCare.findOne({
      where: {
        mobileNumber: mobile
      }
    })
      .then(customer_user => {
        if (customer_user) {
          const old_password = customer_user.password;
          const user_id = customer_user.id;
          decryptedString = cryptr.decrypt(old_password);
          if (password == decryptedString) {
            const token = jwt.jwt_generator(user_id);
            return res
              .status(200)
              .header("Authorization", token)
              .json({
                status: "true",
                message: "Successfully authenticated",
                name: customer_user.name,
                authorization: token
              });
          } else {
            return res.status(400).json({
              status: "false",
              message: "Failure"
            });
          }
        } else {
          return res.status(400).json({
            status: "false",
            message: "Failure"
          });
        }
      })
      .catch(error => {
        return res.status(404).json({
          status: "false",
          error: error
        });
      });
  });
};
