var User = require('../../models/users');
const formidable = require('formidable');
const jwt = require('../jwt');
const redis = require('../redis');

module.exports.profile_update = function (req, res) {
  redis.authenticateToken(req.headers.authorization, (result) => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization)

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, (err, fields, files) => {
          if (err) {
            console.error('Error', err)
            throw err
          }

          const user_id = jwt_result;
          const name = fields['name'];
          const email = fields['email'];
          const mobile = fields['mobile'];
          const dob = fields['dob'];
          const special_date = fields['special_date'];
          
          if (user_id) {
            User.update({
                name: name,
                email: email,
                mobielNumber: mobile,
                DOB: dob,
                specialDate: special_date,
              }, {
                where: {
                  id: user_id
                }
              })
              .then(user_updated => {
                if (user_updated != 0) {
                  res.status(200).json({
                    status: "true",
                    message: "Profile updated successfully"
                  });
                } else {
                  res.status(400).json({
                    status: "false",
                    message: "Unable to update profile"
                  });
                }
              })
              .catch(err => {
                return res.status(400).json({
                  error: err
                });
              });
          } else {
            return res.status(400).json({
              status: "false",
              message: "Please provide valid user"
            });
          }
        });
      } else {
        res.status(400).json({
          status: "false",
          message: "Token not verified"
        });
      }
    } else {
      res.status(400).json({
        status: "false",
        message: "User not Logged In"
      });
    }
  });

}