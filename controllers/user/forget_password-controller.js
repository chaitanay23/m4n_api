const formidable = require('formidable');
const User = require('../../models/users');
const sms = require('../sms');

module.exports.forget=function(req,res){

    new formidable.IncomingForm().parse(req, (err, fields) => {
        if (err) {
          console.error('Error', err)
          throw err
        }
        const mobile=fields["mobile"];
        
        if(mobile)
        {
            User.findOne({where:{mobileNumber:mobile}})
            .then(result => {
                if(result != 0)
                {
                    const otp = sms.generate(6);
                    var sms_message = "Hi! "+otp+" is your MadForNails mobile verification code.\nThis code will expire in 30 minutes.";
                    User.update({
                        otp:otp,
                    },{where:{mobileNumber:mobile}})
                    .then(result =>{
                        if(result > 0)
                        {
                            sms.sendSMS(sms_message,mobile);
                        }
                    })
                    .catch(err=>{
                        res.status(404).json({status:"false",error:err});
                    })    

                    res.status(200).json({status:"true",message:"OTP sent"});
                }
                else
                {
                    res.status(400).json({status:"false",message:"Wrong mobile number"});
                }
            })
            .catch(err=>{
                res.status(404).json({status:"false",error:err});
            });
        }
        else
        {
            res.status(400).json({status:"false",message:"Please provide mobile number"});
        }
    })
}

