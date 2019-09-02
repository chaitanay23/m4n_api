const formidable = require('formidable');
const Video = require('../../models/video-link');
const jwt = require('../jwt');
const redis = require('../redis');

exports.getVideo = (req,res) => {
    redis.authenticateToken(req.headers.authorization,(result)=>{
        if(result == false){
            const jwt_result = jwt.jwt_verify(req.headers.authorization);
    
            if(jwt_result && jwt_result != undefined)
            {
                new formidable.IncomingForm().parse(req, (err, fields,files) => {
                    if (err) {
                        console.error('Error', err)
                        throw err
                    }
                    Video.findAll()
                    .then(video_link =>{
                        if(video_link)
                        {
                            res.status(200).json({status:"true",message:"video link",video:video_link});
                        }
                        else{
                            res.status(400).json({status:"false",message:"no video available"});
                        }
                    })
                    .catch(err=>{
                        res.status(400).json({status:"false",error:err,message:"Failure"});
                    });

                });
            }
            else{
                res.status(400).json({status:"false",message:"Token not verified"});
                }
            }
            else{
                res.status(400).json({status:"false",message: "User not Logged In"});
            }
        });  
    }