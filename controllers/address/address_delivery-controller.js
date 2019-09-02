const formidable = require('formidable');
const Address = require('../../models/address');
const Store = require('../../models/store');
const jwt = require('../jwt');
const redis = require('../redis');

exports.charge = (req, res) => {
    redis.authenticateToken(req.headers.authorization, (result) => {
        if (result == false) {
            const jwt_result = jwt.jwt_verify(req.headers.authorization);

            if (jwt_result && jwt_result != undefined) {
                new formidable.IncomingForm().parse(req, async (err, fields, files) => {
                    if (err) {
                        console.error('Error', err)
                        throw err
                    }

                    const address_id = fields["address_id"];

                    if (address_id != null) {
                        Address.findOne({
                                where: {
                                    id: address_id
                                }
                            })
                            .then(detail => {
                                if (detail != null) {
                                    Store.findOne({
                                            where: {
                                                id: detail.storeId
                                            }
                                        })
                                        .then(store_detail => {
                                            if (store_detail != null) {
                                                return res.status(200).json({
                                                    status: "true",
                                                    message: "delivery charges for given address",
                                                    delivery_charges: store_detail.delivery_charges
                                                });
                                            } else {
                                                return res.status(200).json({
                                                    status: "true",
                                                    message: "No linked store found default delivery charges",
                                                    delivery_charges: 50
                                                });
                                            }
                                        })
                                        .catch(err => {
                                            return res.status(400).json({
                                                status: "false",
                                                error: err,
                                                message:"Failure"
                                            });
                                        });
                                } else {
                                    return res.status(400).json({
                                        status: "false",
                                        message: "No address found"
                                    });
                                }
                            })
                            .catch(err => {
                                return res.status(400).json({
                                    status: "false",
                                    error: err,
                                    message:"Failure"
                                });
                            });
                    } else {
                        return res.status(400).json({
                            status: "false",
                            message: "Please provide address id"
                        });
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