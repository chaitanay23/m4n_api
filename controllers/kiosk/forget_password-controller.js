const formidable = require("formidable");
const Kiosk = require("../../models/kioskUser");

/* sms code */
var request = require("request");
var user_name = process.env.API_username;
var pass_word = process.env.API_password;
var feed_id = process.env.API_feedid;

module.exports.forget = function(req, res) {
  function sendSMS(otp, mobile) {
    var options = {
      method: "POST",
      url: "http://bulkpush.mytoday.com/BulkSms/SingleMsgApi",
      headers: {
        "cache-control": "no-cache",
        "content-type": "application/x-www-form-urlencoded"
      },
      form: {
        username: user_name,
        password: pass_word,
        feedid: feed_id,
        senderid: "SMSOTP",
        sendMethod: "simpleMsg",
        msgType: "text",
        To: mobile,
        text: otp,
        duplicateCheck: "true",
        format: "json"
      }
    };

    request(options, function(error, response, body) {
      if (error) throw new Error(error);

      console.log(body);
    });
  }

  function generate(n) {
    var add = 1,
      max = 12 - add; // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.

    if (n > max) {
      return generate(max) + generate(n - max);
    }

    max = Math.pow(10, n + add);
    var min = max / 10; // Math.pow(10, n) basically
    var number = Math.floor(Math.random() * (max - min + 1)) + min;

    return ("" + number).substring(add);
  }

  new formidable.IncomingForm().parse(req, (err, fields) => {
    if (err) {
      console.error("Error", err);
      throw err;
    }

    var email = fields["email"];
    Kiosk.findOne({ where: { email: email } })
      .then(kiosk_user => {
        if (kiosk_user != null) {
          const otp = generate(6);
          const mobile = kiosk_user.mobileNumber;
          if (mobile != null) {
            Kiosk.update(
              {
                otp: otp
              },
              { where: { email: email } }
            )
              .then(result => {
                if (result) {
                  sendSMS(otp, mobile);

                  return res.send(
                    JSON.stringify({
                      status: "true",
                      message: "OTP send to you mobile number",
                      mobile: mobile
                    })
                  );
                }
              })
              .catch(err => {
                return res.send(JSON.stringify({ error: err }));
              });
          } else {
            return res.send(
              JSON.stringify({
                status: "false",
                message:
                  "No mobile number found on you record please contact admin"
              })
            );
          }
        } else {
          return res.send(
            JSON.stringify({
              status: "false",
              message: "Enter valid email address"
            })
          );
        }
      })
      .catch(err => {
        return res.send(JSON.stringify({ error: err }));
      });
  });
};
