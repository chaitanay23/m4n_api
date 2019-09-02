const formidable = require('formidable');
const Address = require('../../models/address');
const jwt = require('../jwt');
const redis = require('../redis');
const Store = require('../../models/store');

exports.edit_address = (req, res) => {
    redis.authenticateToken(req.headers.authorization, (result) => {
        if (result == false) {
            const jwt_result = jwt.jwt_verify(req.headers.authorization);

            if (jwt_result && jwt_result != undefined) {
                new formidable.IncomingForm().parse(req, async (err, fields, files) => {
                    if (err) {
                        console.error('Error', err)
                        throw err
                    }

                    const user_id = jwt_result;
                    const id = fields["id"];
                    const name = fields["name"];
                    const mobile = fields["mobile"];
                    const type = fields["type"];
                    const state = fields["state"];
                    const city = fields["city"];
                    const area = fields["area"];
                    const address = fields["address"];
                    const zipcode = fields["zipcode"];
                    let store_id;
                    if (id && name && mobile && state && city && zipcode && type && area && address != null) {
                        await Store.findOne({
                                where: {
                                    area: area
                                }
                            })
                            .then(store_area => {
                                if (store_area != null) {
                                    store_id = store_area.id;
                                } else {
                                    Store.findOne({
                                            where: {
                                                zipcode: zipcode
                                            }
                                        })
                                        .then(store_zip => {
                                            if (store_zip) {
                                                store_id = store_zip.id;
                                            } else {
                                                Store.findOne({
                                                        where: {
                                                            city: city
                                                        }
                                                    })
                                                    .then(async store_city => {
                                                        if (store_city) {
                                                            store_id = store_city.id;
                                                        } else {
                                                            await Store.findOne({
                                                                    where: {
                                                                        state: state
                                                                    }
                                                                })
                                                                .then(store_state => {
                                                                    if (store_state) {
                                                                        store_id = store_state.id;
                                                                    } else {
                                                                        store_id = null;
                                                                    }
                                                                })
                                                        }
                                                    })
                                                    .catch(err => {
                                                        return res.status(400).json({
                                                            status: "false",
                                                            error: err,
                                                            message:"Failure"
                                                        });
                                                    })
                                            }
                                        })
                                        .catch(err => {
                                            return res.status(400).json({
                                                status: "false",
                                                error: err,
                                                message:"Failure"
                                            });
                                        });
                                }
                            })
                            .catch(err => {
                                return res.status(400).json({
                                    status: "false",
                                    error: err,
                                    message:"Failure"
                                });
                            })
                            
                        Address.update({
                                name: name,
                                mobile: mobile,
                                type: type,
                                state: state,
                                city: city,
                                area: area,
                                zipcode: zipcode,
                                address: address,
                                storeId: store_id,
                            }, {
                                where: {
                                    id: id
                                }
                            })
                            .then(result => {
                                if (result != 0) {
                                    return res.status(200).json({
                                        status: "true",
                                        message: "Address updated sucessfully",
                                        address_id: id
                                    });
                                } else {
                                    return res.status(400).json({
                                        status: "false",
                                        message: "Address with given id not found"
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
                            message: "Please provide correct details for address"
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