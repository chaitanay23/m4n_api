const formidable = require("formidable");
const Design = require("../../models/design-image");
const jwt = require("../jwt");
const redis = require("../redis");

exports.design_show = (req, res) => {
  redis.authenticateToken(req.headers.authorization, result => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, (err, fields, files) => {
          if (err) {
            console.error("Error", err);
            throw err;
          }

          const user_id = jwt_result;
          const cart_item_id = fields["cart_item_id"];

          if (user_id && cart_item_id) {
            Design.findOne({
              where: {
                userId: user_id,
                cartItemId: cart_item_id
              }
            })
              .then(design_image => {
                if (!design_image) {
                  return res.status(400).json({
                    status: "false",
                    message: "No images found"
                  });
                }
                return res.status(200).json({
                  status: "true",
                  message: "Design images",
                  design_image: design_image
                });
              })
              .catch(err => {
                return res.status(400).json({
                  message: "Error encounter",
                  error: err
                });
              });
          } else {
            return res.status(400).json({
              status: "false",
              message: "Please provide cart item id"
            });
          }
        });
      } else {
        return res.status(400).json({
          message: "Token not verified"
        });
      }
    } else {
      return res.status(400).json({
        message: "User not Logged In"
      });
    }
  });
};
