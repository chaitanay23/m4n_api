const Packages = require("../../models/package");
const fs = require("fs");
const path = require("path");
const short = require('short-uuid');
const formidable = require("formidable");

exports.addPackages = (req, res) => {
  let errors = [];

  new formidable.IncomingForm().parse(req, (err, fields, files) => {
    if (err) console.log(err);
    const name = fields["name"];
    const price = fields["price"];
    const page_title1 = fields["page_title1"];
    const page_title2 = fields["page_title2"];
    const description = fields["description"];
    const colors = JSON.parse(fields["colors"]);
    const customization = JSON.parse(fields["customization"]);
    const fancy_nail_qty = fields["fancy_nail_qty"];
    const flag = fields["flag"];
    const offer = fields["offer"];
    const cta_text = fields["cta_text"];
    const display_price = fields["display_price"];

    if (name == null || name == "") errors.push("Name Required");
    if (price == null || price == "") errors.push("Price Required");
    if (description == null || description == "")
      errors.push("description Required");
    if (colors == null || colors == "") errors.push("colors Required");
    if (customization == null || customization == "")
      errors.push("customization Required");
    if (page_title1 == null || page_title1 == "")
      errors.push("Page title 1 required");
    if (page_title2 == null || page_title2 == "")
      errors.push("Page title 2 required");

    if (!files["imageUrl"]) {
      errors.push("Image not provided");
    } else {
      var imagePath = image(files["imageUrl"], name, false);
    }
    if (errors.length > 0) {
      res.send(JSON.stringify({ errors: errors }));
    } else {
      Packages.create({
        name: name,
        price: price,
        description: description,
        colors: colors,
        customization: customization,
        fancy_nail_qty: fancy_nail_qty,
        flag: flag,
        page_title1: page_title1,
        page_title2: page_title2,
        offer: offer,
        cta_text: cta_text,
        display_price: display_price,
        imageUrl: imagePath
      })
        .then(result => {
          res
            .status(200)
            .json({ status: true, message: "Package added sucessfully" });
        })
        .catch(err => res.send(JSON.stringify({ error: err })));
    }
  });

  const image = (image, name) => {
    if (image.type == "image/jpeg" || "image/png") {
      if (errors.length > 0) {
        res.send(JSON.stringify(errors));
      }
      let extension = path.extname(image.name);
      // let imgName = path.basename(image.name);
      let imgName = short.generate();
      let oldpath = image.path;
      var newpath = "./packageImages/" + imgName;
      fs.rename(oldpath, newpath, err => {
        if (err) throw err;
      });
      db_path = newpath.slice(1, newpath.length);

      return db_path.replace(/\s/g, "");
    }
  };
};

exports.getSinglePackage = (req, res) => {
  let errors = [];
  new formidable.IncomingForm().parse(req, (err, fields, files) => {
    if (err) console.Console.log(err);
    const id = fields["id"];
    if ((id == null) | (id == " ")) {
      errors.push("Provide id");
    }

    if (errors.length > 0) {
      res.send(JSON.stringify({ errors: errors }));
    } else {
      Packages.findByPk(id)
        .then(package => {
          if (package != null) {
            res.status(200).json({ status: true, package });
          } else {
            res
              .status(400)
              .json({ status: false, message: "No Package found" });
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  });
};

exports.updatePackage = (req, res) => {
  let errors = [];
  let paths = [];
  new formidable.IncomingForm().parse(req, (err, fields, files) => {
    if (err) console.log(err);
    const pkgId = fields["pkgId"];
    const name = fields["name"];
    const price = fields["price"];
    const display_price = fields["display_price"];
    const page_title1 = fields["page_title1"];
    const page_title2 = fields["page_title2"];
    const cta_text = fields["cta_text"];
    const description = fields["description"];
    const colors = JSON.parse(fields["colors"]);
    const customization = JSON.parse(fields["customization"]);
    const fancy_nail_qty = fields["fancy_nail_qty"];
    const flag = fields["flag"];
    const offer = fields["offer"];
    if (files["imageUrl"]) {
      var imagePath = image(files["imageUrl"], name, false);
    }

    if (errors.length > 0) {
      res.send(JSON.stringify({ errors: errors }));
    } else {
      Packages.update(
        {
          name: name,
          price: price,
          display_price: display_price,
          page_title1: page_title1,
          page_title2: page_title2,
          description: description,
          colors: colors,
          customization: customization,
          fancy_nail_qty: fancy_nail_qty,
          flag: flag,
          offer: offer,
          cta_text: cta_text,
          imageUrl: imagePath
        },
        { where: { id: pkgId } }
      )
        .then(result => {
          if (result == "1") {
            res
              .status(200)
              .json({ message: "Updated Sucessfully", status: true });
          } else {
            res.status(400).json({ message: "Updated failed", status: false });
          }
        })
        .catch(err => {
          res.status(400).json({ message: err, Status: false });
        });
    }
  });
  const image = (image, name) => {
    if (image.type == "image/jpeg" || "image/png") {
      if (errors.length > 0) {
        res.send(JSON.stringify(errors));
      }
      let extension = path.extname(image.name);
      // let imgName = path.basename(image.name);
      let imgName = short.generate();
      let oldpath = image.path;
      var newpath = "./packageImages/" + imgName;
      fs.rename(oldpath, newpath, err => {
        if (err) throw err;
      });
      db_path = newpath.slice(1, newpath.length);

      return db_path.replace(/\s/g, "");
    }
  };
};

exports.upDateFlag = (req, res) => {
  let errors = [];
  new formidable.IncomingForm().parse(req, (err, fields, files) => {
    const id = fields["id"];
    const flag = fields["flag"];
    Packages.update(
      {
        flag: flag
      },
      { where: { id: id } }
    )
      .then(resp => {
        if (resp == 1) {
          res.status(200).json({ status: true, message: "Updated" });
        } else {
          res.status(400).json({ status: false, message: "failure" });
        }
      })
      .catch(err => {
        res.json({ error: err });
      });
  });
};

exports.upDateCustomize = (req, res) => {
  let errors = [];
  new formidable.IncomingForm().parse(req, (err, fields, files) => {
    const id = fields["id"];
    const isCustomizable = fields["isCustomizable"];
    Packages.update(
      {
        isCustomizable: isCustomizable
      },
      { where: { id: id } }
    )
      .then(resp => {
        if (resp == 1) {
          res.status(200).json({ status: true, message: "Updated" });
        } else {
          res.status(400).json({ status: false, message: "failure" });
        }
      })
      .catch(err => {
        res.json({ error: err });
      });
  });
};

exports.getAllPackges = (req, res) => {
  Packages.findAll({
    order: [["updatedAt", "DESC"]],
    attributes: [
      "id",
      "name",
      "price",
      "flag",
      "isCustomizable",
      "imageUrl",
      "description"
    ]
  })
    .then(packages => {
      res.status(200).json({ status: true, packages: packages });
    })
    .catch(err => {
      console.log(err);
    });
};
