const formidable = require('formidable');
const Hand = require('../../models/hand-image');
const jwt = require('../jwt');
const redis = require('../redis');

exports.hand_show = (req, res) => {

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
                        Hand.findAll({
                                where: {
                                    userId: user_id
                                }
                            })
                            .then(hand_image => {
                                if (hand_image.length > 0) {
                                    return res.status(200).json({
                                        status: "true",
                                        hand_image: hand_image
                                    })
                                } else {
                                    return res.status(400).json({
                                        status: "false",
                                        message: "Please provide correct user"
                                    });
                                }
                            })
                            .catch(err => {
                                return res.status(400).json({
                                    status: "false",
                                    message: "Error encounter",
                                    error: err
                                })
                            })
                    } else {
                        Hand.findAll()
                            .then(hand_images => {
                                return res.status(200).json({
                                    status: "true",
                                    hand_images: hand_images
                                })
                            })
                            .catch(err => {
                                return res.status(400).json({
                                    status: "false",
                                    message: "Error encounter",
                                    error: err
                                })
                            })
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