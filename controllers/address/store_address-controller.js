const formidable = require('formidable');
const Store = require('../../models/store');
const jwt = require('../jwt');
const redis = require('../redis');

exports.store_address = (req, res) => {

    redis.authenticateToken(req.headers.authorization, (result) => {
        if (result == false) {
            const jwt_result = jwt.jwt_verify(req.headers.authorization);

            if (jwt_result && jwt_result != undefined) {
                new formidable.IncomingForm().parse(req, async (err, fields, files) => {
                    if (err) {
                        console.error('Error', err)
                        throw err
                    }

                    Store.findAll()
                        .then(store => {
                            if (store != null) {
                                return res.status(200).json({
                                    status: "true",
                                    message: "Store address list",
                                    address: store
                                });
                            } else {
                                return res.status(400).json({
                                    status: "false",
                                    message: "No store found"
                                });
                            }
                        })
                        .catch(err => {
                            return res.status(400).json({
                                status: "false",
                                message: "Error encounter",
                                error: err
                            });
                        })
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