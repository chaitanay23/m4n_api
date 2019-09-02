const formidable = require('formidable');
const Address = require('../../models/address');
const jwt = require('../jwt');
const redis = require('../redis');

exports.show_address = (req, res) => {
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
                        Address.findAll({
                                where: {
                                    userId: user_id
                                }
                            })
                            .then(address => {
                                return res.status(200).json({
                                    status: "true",
                                    message: "Address list",
                                    address: address
                                });
                            })
                            .catch(err => {
                                return res.status(400).json({
                                    status: "false",
                                    message: "Error encounter",
                                    error: err
                                });
                            })
                    } else {
                        Address.findAll()
                            .then(address => {
                                return res.status(200).json({
                                    status: "true",
                                    address: address
                                });
                            })
                            .catch(err => {
                                return res.status(400).json({
                                    status: "false",
                                    message: "Error encounter",
                                    error: err
                                });
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