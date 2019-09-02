const formidable = require('formidable');
const Finger = require('../../models/finger-size');
const jwt = require('../jwt');
const redis = require('../redis');

exports.single_size = (req, res) => {
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
                        Finger.findOne({
                                where: {
                                    userId: user_id
                                }
                            })
                            .then(finger_size => {
                                return res.status(200).json({
                                    status:"true",
                                    message:"user finger size",
                                    finger_size: finger_size
                                });
                            })
                            .catch(err => {
                                return res.status(400).json({
                                    status:"false",
                                    message: "Error encounter",
                                    error: err
                                });
                            })
                    } else {
                        return res.status(400).json({
                            status:"false",
                            message:"no user id found"
                        })
                    }
                });
            } else {
                return res.status(400).json({
                    status:"false",
                    message: "Token not verified"
                });
            }
        } else {
            return res.status(400).json({
                status:"false",
                message: "User not Logged In"
            });
        }
    });
}