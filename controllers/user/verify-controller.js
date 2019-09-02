
const formidable = require('formidable');
const User = require('../../models/users');

module.exports.verification=function(req,res){
  new formidable.IncomingForm().parse(req, (err, fields) => {
      if (err) {
        console.error('Error', err)
        throw err
      }

    const mobile = fields["mobile"];
    const otp = fields["otp"];
    
    User.findOne({
      where:{mobileNumber:mobile,
        otp:otp}
    })
    .then(user =>{
      if(user){
        res.status(200).json({status:"true",message:"OTP verified"});
      }
      else{
        res.status(400).json({status:"false",message:"Wrong OTP entered"});
      }
    })
  });
}