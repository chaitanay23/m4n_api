const Packages = require("../../models/package");
const fs = require("fs");
const path = require("path");
const formidable = require("formidable");

exports.addPackages = (req, res) => {
  let errors = [];

  new formidable.IncomingForm().parse(req, (err, fields, files) => {
    if (err) console.log(err);
    const name = fields["name"];
    const price = fields["price"];
    const description = fields["description"];
    const colors = JSON.parse(fields["colors"]);
    const customization = JSON.parse(fields["customization"]);
    const fancy_nail_qty = fields["fancy_nail_qty"];
    const flag = fields["flag"];
    const offer = fields["offer"];
    const ctn_text = fields["ctn_text"];

    if (name == null || name == "") errors.push("Name Required");
    if (price == null || price == "") errors.push("Price Required");
    if (description == null || description == "")
      errors.push("description Required");
    if (colors == null || colors == "") errors.push("colors Required");
    if (customization == null || customization == "")
      errors.push("customization Required");

    if (!files["imageUrl"]) {
      errors.push("Image not provided");
    } else {
      var imagePath = image(files["imageUrl"], title, false);
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
        offer: offer,
        ctn_text: ctn_text,
        imageUrl: imagePath
      })
        .then(result => {
          res
            .status(200)
            .send(JSON.stringify({ message: "Package added sucessfully" }));
          res.end();
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
      let oldpath = image.path;
      var newpath = "./packageImages/" + name + extension;

      fs.rename(oldpath, newpath, err => {
        if (err) throw err;
      });
      db_path = newpath.slice(1, newpath.length);

      return db_path;
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
            res.json(package);
          } else {
            res.status(200).json({ message: "No Package found" });
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
  new formidable.IncomingForm().parse(req, (err, fields, files) => {
    if (err) console.log(err);
    const pkgId = fields["pkgId"];
    const name = fields["name"];
    const price = fields["price"];
    const description = fields["description"];
    const colors = JSON.parse(fields["colors"]);
    const customization = JSON.parse(fields["customization"]);
    const fancy_nail_qty = fields["fancy_nail_qty"];
    const flag = fields["flag"];
    const offer = fields["offer"];
    if (name == null || name == "") errors.push("Name Required");
    if (price == null || price == "") errors.push("Price Required");
    if (description == null || description == "")
      errors.push("description Required");
    if (colors == null || colors == "") errors.push("colors Required");
    if (customization == null || customization == "")
      errors.push("customization Required");

    if (errors.length > 0) {
      res.send(JSON.stringify({ errors: errors }));
    } else {
      Packages.update(
        {
          name: name,
          price: price,
          description: description,
          colors: colors,
          customization: customization,
          fancy_nail_qty: fancy_nail_qty,
          flag: flag,
          offer: offer
        },
        { where: { id: pkgId } }
      )
        .then(result => {
          if (result == "1") {
            res
              .status(200)
              .json({ message: "Updated Sucessfully", Status: "true" });
          } else {
            res.status(200).json({ message: "Updated failed", Status: "true" });
          }
        })
        .catch(err => {
          res.status(400).json({ message: err, Status: "false" });
        });
    }
  });
};

exports.getAllPackges = (req, res) => {
  Packages.findAll()
    .then(packages => {
      res.status(200).json({ packages: packages });
    })
    .catch(err => {
      console.log(err);
    });
};
