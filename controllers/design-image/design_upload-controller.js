const formidable = require('formidable');
const Design = require('../../models/design-image');
const fs = require('fs');
var path = require('path');
const jwt = require('../jwt');
const redis = require('../redis');

exports.design_image = (req, res) => {
    redis.authenticateToken(req.headers.authorization, (result) => {
        if (result == false) {
            const jwt_result = jwt.jwt_verify(req.headers.authorization);

            if (jwt_result && jwt_result != undefined) {
                new formidable.IncomingForm().parse(req, (err, fields, files) => {
                    if (err) {
                        console.error('Error', err)
                        throw err
                    }

                    function designUpload(image, type) {
                        if (image != null) {
                            if (image.type == 'image/jpeg' || 'image/png') {
                                var extention = path.extname(image.name);
                                var old_path = image.path;
                                var new_path = './design-uploads/' + type + '_' + user_id + extention;
                                fs.rename(old_path, new_path, (err) => {
                                    if (err) throw err;
                                    else console.log('Successfully moved');
                                });
                                db_path = new_path.slice(1, new_path.length);

                                return (db_path);
                            }
                        }
                    }

                    var user_id = jwt_result;
                    left_design = designUpload(files.left_design, type = 'left_design');
                    right_design = designUpload(files.right_design, type = 'right_design');

                    Design.findOne({
                            where: {
                                userId: user_id
                            }
                        })
                        .then(result => {
                            if (result) {
                                Design.update({
                                        left_hand_design: left_design,
                                        right_hand_design: right_design,
                                    }, {
                                        where: {
                                            userId: user_id
                                        }
                                    })
                                    .then(update => {
                                        if (update) {
                                            return res.status(200).json({
                                                status:"true",
                                                message: "Design images updated successfully"
                                            });
                                        } else {
                                            return res.status(400).json({
                                                status:"false",
                                                message: "Error updating images"
                                            });
                                        }
                                    })
                                    .catch(err => {
                                        return res.status(400).json({
                                            status:"false",
                                            message:"Failure",
                                            error: err
                                        });
                                    })
                            } else {
                                Design.create({
                                        userId: user_id,
                                        left_hand_design: left_design,
                                        right_hand_design: right_design,
                                    })
                                    .then(create => {
                                        if (create) {
                                            return res.status(200).json({
                                                status:"true",
                                                message: "Design images uploaded successfully"
                                            });
                                        } else {
                                            return res.status(400).json({
                                                status:"false",
                                                message: "Error uploding images"
                                            });
                                        }
                                    })
                                    .catch(err => {
                                        return res.status(400).json({
                                            status:"false",
                                            message:"Failure",
                                            error: err
                                        });
                                    })
                            }
                        })
                        .catch(err => {
                            return res.status(400).json({
                                status:"false",
                                message:"Failure",
                                error: err
                            });
                        })
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