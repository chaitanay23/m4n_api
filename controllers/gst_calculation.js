const Gst = require("../models/gsttax");

exports.tax_amt = (amount, callback) => {
  Gst.findOne().then(gst => {
    tax = amount - amount / ((100 + gst.tax) / 100);
    tax = parseFloat(tax).toFixed(2);
    callback(tax);
  });
};
