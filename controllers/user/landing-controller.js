const Cryptr = require('cryptr');
cryptr = new Cryptr('myTotalySecretKey');
const formidable = require('formidable');
const jwt = require('jsonwebtoken');
const User = require('../../models/users');
const Sequelize = require('sequelize');
const Op = Sequelize.Op
const sms = require('../sms');


exports.register=(req,res) => {

    var today = new Date();
   
  new formidable.IncomingForm().parse(req, (err, fields) => {
    if (err) {
      console.error('Error', err)
      throw err
    }

    const otp = sms.generate(6);
    const mobile = fields["mobile"];
    const kiosk_id = fields["kiosk_id"];

    var sms_message = "Hi! "+otp+" is your MadForNails mobile verification code.\nThis code will expire in 30 minutes.";
    if(mobile)
    {
      User.findOne({where:{
        mobileNumber:mobile
        
      }})
      .then(user =>{
        if(user)
        {
          if(user.length != 0 && user["password"] != null){
            res.status(200).json({status:"true",message:"User already exists",user_id:user.id,user_name: user.name});
          }
          else if(user.length != 0)
          {
            User.update({
              otp:otp
              },{where:{mobileNumber:mobile}})
              .then(result =>{
                if(result)
                {
                  sms.sendSMS(sms_message,mobile);

                  res.status(200).json({status:"true",message:"OTP sent"});
                }
              })
              .catch(err=>{
                res.status(400).json({status:"false",error:err});
              })
            
          }
        }
        else{
          User.create(
            {
            mobileNumber:mobile,
            otp:otp,
            kioskUserId:kiosk_id,
            })
            .then(result =>{
              if(result)
              {
                sms.sendSMS(sms_message,mobile);

                res.status(200).json({status:"true",message:"OTP sent"});
              }
            })
            .catch(err=>{
              res.status(400).json({status:"false",error:err});
            })
        }
      }) 
    }
    else
    {
      res.status(400).json({status:"false",message:"Failure"});
    }
  })

}

