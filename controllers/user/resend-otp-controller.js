const formidable = require('formidable');
const User = require('../../models/users');
const Sequelize = require('sequelize');
const Op = Sequelize.Op
const sms = require('../sms');

exports.resend=(req,res) => {
    
  new formidable.IncomingForm().parse(req, (err, fields) => {
    if (err) {
      console.error('Error', err)
      throw err
    }

    const otp = sms.generate(6);
    const mobile = fields["mobile"];

    var sms_message = "Hi! "+otp+" is your MadForNails mobile verification code.\nThis code will expire in 30 minutes.";

    if(mobile)
    {
      User.findOne({where:{
        mobileNumber:mobile,
        password:{
          [Op.ne]:null
        }
      }})
      .then(user =>{
        if(user){
          res.status(200).json({status:"true",message:"User already exists",user_id:user.id});
        }
        else
        {
          User.update(
            {
            otp:otp},
            {where:{mobileNumber:mobile},
            })
            .then(result =>{
              if(result > 0)
              {
                sms.sendSMS(sms_message,mobile);

                res.status(200).json({status:"true",message:"OTP sent"});
              }
            })
            .catch(err=>{
              res.status(404).json({status:"false",error:err});
            })
          
        }
      }) 
    }
    else
    {
      res.status(400).json({status:"false",message:"Please provide mobile number"});
    }
  })

}

