const Preset = require("../../models/preset");
const fs = require("fs");
const path = require("path");
const formidable = require("formidable");

exports.addPreset = (req, res) => {
  let errors = [];

  new formidable.IncomingForm().parse(req, (err, fields, files) => {
    if (err) console.log(err);
    const name = fields["name"];
    const lf1 = fields["lf1"];
    const lf2 = fields["lf2"];
    const lf3 = fields["lf3"];
    const lf4 = fields["lf4"];
    const lf5 = fields["lf5"];
    const rf1 = fields["rf1"];
    const rf2 = fields["rf2"];
    const rf3 = fields["rf3"];
    const rf4 = fields["rf4"];
    const rf5 = fields["rf5"];
  });
};
