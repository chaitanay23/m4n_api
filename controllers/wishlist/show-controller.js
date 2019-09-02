const formidable = require('formidable');
const jwt = require('../jwt');
const redis = require('../redis');
const Wishlist = require('../../models/wishlist');
const Product = require('../../models/product');

exports.show_wishlist = (req,res) => {
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
                    var product_attribute = ['id','title','product_code','product_type','imageUrl','price','description'];

                    Wishlist.findAll({
                        where:{userId:user_id},
                        include:[
                            {model:Product,attributes:product_attribute}
                        ]
                    })
                    .then(all_wishlist =>{
                        if(all_wishlist.length > 0)
                        {
                            res.status(200).json({status:"true",message:"All wishlisted products",wishlist:all_wishlist});
                        }
                        else{
                            res.status(400).json({status:"false",message:"No wishlisted item found"});
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