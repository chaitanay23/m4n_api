const request = require("request");
const ENV = require("../env");
const axios = require("axios");

var delhivery = function() {
  return {
    assign_waybill: axios.get(ENV.LOGISTICS_DELHIVERY_GENERATE_WAYBILL),
    track_order: axios.get(ENV.LOGISTICS_DELHIVERY_TRACK_ORDER),
    pincode_isServiceable: axios.get(ENV.LOGISTICS_DELHIVERY_PINCODE)
  };
};

module.exports = delhivery;
