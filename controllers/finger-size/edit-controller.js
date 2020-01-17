const formidable = require("formidable");
const Finger = require("../../models/finger-size");
//not in use //this api we will remove
//this functionality is added to another api
exports.size_chnage = (req, res) => {
  new formidable.IncomingForm().parse(req, (err, fields, files) => {
    if (err) {
      console.error("Error", err);
      throw err;
    }

    var user_id = fields["user_id"];
    var lf1 = fields["L1"];
    var lf2 = fields["L2"];
    var lf3 = fields["L3"];
    var lf4 = fields["L4"]; //1st finger index finger
    var lf5 = fields["LT"]; //thumb left
    var rf1 = fields["R1"];
    var rf2 = fields["R2"];
    var rf3 = fields["R3"];
    var rf4 = fields["R4"]; //last finger
    var rf5 = fields["RT"]; //thumb right

    if (user_id != null) {
      Finger.update(
        {
          lf1: lf1,
          lf2: lf2,
          lf3: lf3,
          lf4: lf4,
          lf5: lf5,
          rf1: rf1,
          rf2: rf2,
          rf3: rf3,
          rf4: rf4,
          rf5: rf5
        },
        {
          where: { userId: user_id }
        }
      )
        .then(result => {
          return res.send(
            JSON.stringify({
              status: "true",
              message: "Sizes updated sucessfully"
            })
          );
        })
        .catch(err => {
          return res.send(JSON.stringify({ status: "false", error: err }));
        });
    } else {
      return res.send(
        JSON.stringify({ status: "false", message: "Please provide user" })
      );
    }
  });
};
