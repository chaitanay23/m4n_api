const formidable = require('formidable');
const Factory = require('../../models/factory-user');
const jwt = require('../jwt');

module.exports.authenticate = function (req, res) {
  new formidable.IncomingForm().parse(req, (err, fields) => {
    if (err) {
      console.error('Error', err)
      throw err
    }

    const mobile = fields["mobile"];
    const password = fields["password"];
    Factory.findOne({
        where: {
          mobileNumber: mobile
        }
      })
      .then(factory_user => {
        if (factory_user) {
          const old_password = factory_user.password;
          const user_id = factory_user.id;
          decryptedString = cryptr.decrypt(old_password);
          if (password == decryptedString) {
            const token = jwt.jwt_generator(user_id);
            return res.status(200).header('Authorization', token).json({
              status: "true",
              message: "Successfully authenticated",
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
      })
  })
}