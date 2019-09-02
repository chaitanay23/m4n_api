const formidable = require('formidable');
const Design = require('../../models/design-image');
const jwt = require('../jwt');
const redis = require('../redis');

exports.design_show = (req, res) => {
    redis.authenticateToken(req.headers.authorization, (result) => {
        if (result == false) {
            const jwt_result = jwt.jwt_verify(req.headers.authorization);

            if (jwt_result && jwt_result != undefined) {
                new formidable.IncomingForm().parse(req, (err, fields, files) => {
                    if (err) {
                        console.error('Error', err)
                        throw err
                    }

                    var user_id = jwt_result;
                    if (user_id != null) {
                        Design.findAll({
                                where: {
                                    userId: user_id
                                }
                            })
                            .then(design_image => {
                                return res.status(200).json({
                                    design_image: design_image
                                })
                            })
                            .catch(err => {
                                return res.status(400).json({
                                    message: "Error encounter",
                                    error: err
                                })
                            })
                    } else {
                        Design.findAll()
                            .then(design_image => {
                                return res.status(200).json({
                                    design_image: design_image
                                })
                            })
                            .catch(err => {
                                return res.status(400).json({
                                    message: "Error encounter",
                                    error: err
                                })
                            })
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
}