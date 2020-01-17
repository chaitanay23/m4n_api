/* sms code */
var request = require("request");
var ENV = require("../env");

exports.sendSMS = (sms_message, mobile) => {
  var options = {
    method: "POST",
    url: "http://bulkpush.mytoday.com/BulkSms/SingleMsgApi",
    headers: {
      "cache-control": "no-cache",
      "content-type": "application/x-www-form-urlencoded"
    },
    form: {
      username: ENV.USERNAME,
      password: ENV.PASSWORD,
      feedid: ENV.FEEDID,
      senderid: "MFNAIL",
      sendMethod: "simpleMsg",
      msgType: "text",
      To: mobile,
      text: sms_message,
      duplicateCheck: "true",
      format: "json"
    }
  };
  request(options, function(error, response, body) {
    if (error) throw new Error(error);

    console.log(body);
  });
};

exports.generate = n => {
  var add = 1,
    max = 12 - add; // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.

  if (n > max) {
    return generate(max) + generate(n - max);
  }

  max = Math.pow(10, n + add);
  var min = max / 10; // Math.pow(10, n) basically
  var number = Math.floor(Math.random() * (max - min + 1)) + min;

  return ("" + number).substring(add);
};
