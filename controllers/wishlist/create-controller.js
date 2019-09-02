const formidable = require('formidable');
const jwt = require('../jwt');
const redis = require('../redis');
const Wishlist = require('../../models/wishlist');

exports.add_wishlist = (req,res) => {
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

                    const user_id = jwt_result;
                    const product_id = fields["product_id"];
                    if(product_id)
                    {
                        Wishlist.findOne({where:{userId:user_id,productId:product_id}})
                        .then(found_wishlist =>{
                            if(found_wishlist)
                            {
                                Wishlist.destroy({where:{userId:user_id,productId:product_id}})
                                .then(remove=>{
                                    if(remove > 0)
                                    {
                                        res.status(200).json({status:"true",message:"Product removed from wishlist"});
                                    }
                                    else{
                                        res.status(400).json({status:"false",message:"Product not in wishlist"});
                                    }
                                })
                                .catch(err=>{
                                    res.status(400).json({status:"false",error:err,message:"Failure"});
                                });
                            }
                            else{
                                Wishlist.create({
                                    userId:user_id,
                                    productId:product_id
                                })
                                .then(new_wishlist =>{
                                    if(new_wishlist)
                                    {
                                        res.status(200).json({status:"true",message:"Product added to wishlist",wishlist_id:new_wishlist.id});
                                    }
                                    else{
                                        res.status(400).json({status:"false",message:"Unable to add to wishlist"});
                                    }
                                })
                                .catch(err=>{
                                    res.status(400).json({status:"false",error:err,message:"Failure"});
                                });
                            }
                        })
                        .catch(err=>{
                            res.status(400).json({status:"false",error:err,message:"Failure"});
                        });
                    }
                    else{
                        res.status(400).json({status:"false",message:"Please provide product id"});
                    }
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