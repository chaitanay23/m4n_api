var request = require("request");
const ENV = require("../env");
const url = ENV.BASEURL;
// not required
exports.delivery_charge = (token, address_id, callback) => {
  var base_url = url + "/address/delivery-charge";
  var headers = {
    Authorization: token
  };
  var form = {
    address_id: address_id
  };
  request.post(
    {
      url: base_url,
      form: form,
      headers: headers
    },
    function(e, header, body) {
      callback(header.statusCode, body);
    }
  );
};
