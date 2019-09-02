const formidable = require('formidable');
const Address = require('../../models/address');
const jwt = require('../jwt');
const redis = require('../redis');


exports.delete_address = (req, res) => {
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
                    const address_id = fields["address_id"];

                    Address.destroy({
                        where: {
                          id: address_id
                        }
                    })
                    .then(del =>{
                        if(del > 0)
                        {
                            return res.status(200).json({
                                status:"true",
                                message:"Address deleted successfully"
                            });
                        }
                        else{
                            return res.status(400).json({
                                status:"false",
                                message:"Failure"
                            });
                        }
                    })
                    .catch(err => {
                        return res.status(400).json({
                            status:"false",
                            error: err
                        });
                    });

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