const Ref_id = require("../models/reference_id");
const sequelize = require("sequelize");

exports.reference = callback => {
  let raw_query = "select gen_ref() as ref";
  Ref_id.sequelize
    .query(raw_query, {
      type: sequelize.QueryTypes.SELECT
    })
    .then(ref_num => {
      if (ref_num) {
        var date = new Date();
        var now =
          date.getFullYear() +
          "" +
          ("0" + (date.getMonth() + 1)).slice(-2) +
          "" +
          ("0" + date.getDate()).slice(-2);
        var final_ref = now + "" + ref_num[0].ref;
        callback(final_ref);
      }
    });
};
