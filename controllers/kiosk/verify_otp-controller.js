
const formidable = require('formidable');
const Kiosk = require('../../models/kioskUser');

module.exports.verification=function(req,res){
  new formidable.IncomingForm().parse(req, (err, fields) => {
      if (err) {
        console.error('Error', err)
        throw err
      }
      
    var email=fields["email"];
    var otp = fields["otp"];
    
    Kiosk.findOne({where:{email:email,otp:otp}})
    .then(kiosk_users =>{
      if(kiosk_users != null){
        return res.send(JSON.stringify({status:"true",message:"OTP verified"}));
      }
      else{

        return res.send(JSON.stringify({status:"false",message:"Wrong OTP entered"}));
      }
      })
    });
}