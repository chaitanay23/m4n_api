const formidable = require('formidable');
const Order = require('../../models/order');
const Address = require('../../models/address');
const jwt = require('../jwt');
const redis = require('../redis');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Finger = require('../../models/finger-size');
const User = require('../../models/users');

exports.UserDetail = (req, res) => {
    redis.authenticateToken(req.headers.authorization, (result) => {
        if (result == false) {

            const jwt_result = jwt.jwt_verify(req.headers.authorization);

            if (jwt_result && jwt_result != undefined) {
                new formidable.IncomingForm().parse(req, async (err, fields, files) => {
                    if (err) {
                        return res.status(500).json({
                            status:"false",
                            message:"Error",
                            error:err
                        });
                    }

                    const mobile = fields["mobile"];
                    if(!mobile)
                    {
                        return res.status(400).json({
                            status:"false",
                            message:"Please provide mobile number"
                        })
                    }
                    User.findOne({
                        where:{mobileNumber:mobile},
                        include:[
                            {
                                model:Address,
                                attributes: ['id', 'name', 'type', 'mobile', 'state', 'city', 'area', 'address', 'zipcode']
                            },
                            {
                                model:Finger
                            },
                            {
                                model:Order
                            }
                        ]
                    })
                    .then(user_detail =>{
                        if(!user_detail)
                        {   
                            return res.status(400).json({
                                status:"false",
                                message:"Wrong mobile number"
                            });
                        }
                        else{
                            return res.status(200).json({
                                status:"true",
                                message:"User details",
                                user:user_detail
                            })
                        }
                    })
                    .catch(err=>{
                        return res.status(400).json({status:"false",error:err,message:"Failure"});
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