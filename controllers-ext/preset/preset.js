const Preset = require("../../models/preset");
const fs = require("fs");
const path = require("path");
const short = require('short-uuid');
const formidable = require("formidable");

exports.addPreset = (req, res) => {
  let errors = [];

  const image = (image, name) => {
    if (image.mimetype == "image/jpeg" || "image/png") {
      if (errors.length > 0) {
        res.send(JSON.stringify(errors));
      }
      let extension = path.extname(image.originalname);
      // let imgName = path.basename(image.originalname).replace(/\s/g, "");
      let imgName = short.generate();
      let oldpath = image.path;
      var newpath = "./preset_images/" + imgName;
      fs.rename(oldpath, newpath, err => {
        if (err) throw err;
      });
      db_path = newpath.slice(1, newpath.length);

      return db_path.replace(/\s/g, "");
    }
  };

  if (req.body) {
    var name = req.body.name;
    var description = req.body.description;
    var hot_selling = req.body.hot_selling;
    var new_selling = req.body.new;
    var lf1 = req.body.lf1;
    var lf2 = req.body.lf2;
    var lf3 = req.body.lf3;
    var lf4 = req.body.lf4;
    var lf5 = req.body.lf5;
    var rf1 = req.body.rf1;
    var rf2 = req.body.rf2;
    var rf3 = req.body.rf3;
    var rf4 = req.body.rf4;
    var rf5 = req.body.rf5;
    var pkgId = req.body.pkgId;

    if (name == null || name == "") errors.push("provide name");
    if (description == null || description == "")
      errors.push("provide description");
    if (hot_selling == null || hot_selling == "")
      errors.push("provide hot_selling");
    if (new_selling == null || new_selling == "")
      errors.push("provide new selling");
  } else {
    res.status(400).json({ status: false });
  }
  if (req.files) {
    let paths = [];
    var imagePath;
    for (const item in req.files) {
      if (req.files[item].fieldname == "image") {
        imagePath = image(req.files[item]);
      } else if (imagePath == "") {
        res.status(400).json({ status: false, message: "Provide Image" });
      }
      if (req.files[item].fieldname == "images") {
        var imagePaths;
        var conpath = image(req.files[item]);
        paths.push(conpath);
        imagePaths = paths.join();
      } else if (imagePaths == "") {
        res.status(400).json({ status: false, message: "Provide Images" });
      }
    }
  } else {
    res.status(400).json({ status: false, message: "No Images" });
  }

  if (errors.length > 0) {
    res.status(400).json({ status: false, errors: errors });
  } else {
    if (req.body && req.files) {
      Preset.create({
        name: name,
        description: description,
        hot_selling: hot_selling,
        new: new_selling,
        image: imagePath,
        images: imagePaths,
        lf1: lf1,
        lf2: lf2,
        lf3: lf3,
        lf4: lf4,
        lf5: lf5,
        rf1: rf1,
        rf2: rf2,
        rf3: rf3,
        rf4: rf4,
        rf5: rf5,
        packageId: pkgId
      })
        .then(result => {
          res
            .status(200)
            .json({ status: true, message: "Preset added sucessfully" });
        })
        .catch(err => {
          res.status(400).json({ status: false, error: err });
        });
    }
  }
};

exports.updatePreset = (req, res) => {
  let errors = [];

  const image = (image, name) => {
    if (image.mimetype == "image/jpeg" || "image/png") {
      if (errors.length > 0) {
        res.send(JSON.stringify(errors));
      }
      let extension = path.extname(image.originalname);
      // let imgName = path.basename(image.originalname).replace(/\s/g, "");
      let imgName = short.generate();
      let oldpath = image.path;
      var newpath = "./preset_images/" + imgName;
      fs.rename(oldpath, newpath, err => {
        if (err) throw err;
      });
      db_path = newpath.slice(1, newpath.length);

      return db_path.replace(/\s/g, "");
    }
  };

  if (req.body != undefined) {
    var id = req.body.id;
    var name = req.body.name;
    var description = req.body.description;
    var hot_selling = req.body.hot_selling;
    var new_selling = req.body.new;
    var lf1 = req.body.lf1;
    var lf2 = req.body.lf2;
    var lf3 = req.body.lf3;
    var lf4 = req.body.lf4;
    var lf5 = req.body.lf5;
    var rf1 = req.body.rf1;
    var rf2 = req.body.rf2;
    var rf3 = req.body.rf3;
    var rf4 = req.body.rf4;
    var rf5 = req.body.rf5;
    var pkgId = req.body.pkgId;
  }
  if (req.files.length > 0) {
    let paths = [];
    var imagePath;

    for (const item in req.files) {
      if (req.files[item].fieldname == "image") {
        imagePath = image(req.files[item]);
      }
      if (req.files[item].fieldname == "images") {
        var imagePaths;
        var conpath = image(req.files[item]);
        paths.push(conpath);
        imagePaths = paths.join();
      }
    }
  }

  if (errors.length > 0) {
    res.status(400).json({ status: false, errors: errors });
  } else {
    Preset.update(
      {
        name: name,
        description: description,
        hot_selling: hot_selling,
        new: new_selling,
        image: imagePath,
        images: imagePaths,
        lf1: lf1,
        lf2: lf2,
        lf3: lf3,
        lf4: lf4,
        lf5: lf5,
        rf1: rf1,
        rf2: rf2,
        rf3: rf3,
        rf4: rf4,
        rf5: rf5,
        packageId: pkgId
      },
      { where: { id: id } }
    )
      .then(result => {
        res
          .status(200)
          .json({ status: true, message: "Preset updated sucessfully" });
      })
      .catch(err => {
         res.status(400).json({ status: false, error: err });
      });
  }
};

exports.getAllPreset = (req, res) => {
  Preset.findAll({
    order: [["updatedAt", "DESC"]],
    attributes: ["id", "name", "image", "hot_selling", "new", "description"]
  })
    .then(preset => {
      res.status(200).json({
        status: true,
        preset: preset
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.updateHot_sell = (req, res) => {
  let errors = [];
  new formidable.IncomingForm().parse(req, (err, fields, files) => {
    const id = fields["id"];
    const hot_sell = fields["hot_selling"];
    Preset.update(
      {
        hot_selling: hot_sell
      },
      {
        where: {
          id: id
        }
      }
    )
      .then(resp => {
        if (resp == 1) {
          res.status(200).json({
            status: true,
            message: "Updated"
          });
        } else {
          res.status(400).json({
            status: false,
            message: "failure"
          });
        }
      })
      .catch(err => {
        res.json({
          error: err
        });
      });
  });
};

exports.updateNew_sell = (req, res) => {
  let errors = [];
  new formidable.IncomingForm().parse(req, (err, fields, files) => {
    const id = fields["id"];
    const newValue = fields["new"];
    Preset.update(
      {
        new: newValue
      },
      {
        where: {
          id: id
        }
      }
    )
      .then(resp => {
        if (resp == 1) {
          res.status(200).json({
            status: true,
            message: "Updated"
          });
        } else {
          res.status(400).json({
            status: false,
            message: "failure"
          });
        }
      })
      .catch(err => {
        res.json({
          error: err
        });
      });
  });
};

exports.getSinglePreset = (req, res) => {
  let errors = [];
  new formidable.IncomingForm().parse(req, (err, fields, files) => {
    if (err) console.Console.log(err);
    const id = fields["id"];
    if ((id == null) | (id == " ")) {
      errors.push("Provide id");
    }

    if (errors.length > 0) {
      res.status(400).json({ status: false, errors: errors });
    } else {
      Preset.findByPk(id)
        .then(preset => {
          if (preset != null) {
            res.status(200).json({ preset: preset, status: true });
          } else {
            res
              .status(400)
              .json({ message: "No Package found", status: false });
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  });
};
