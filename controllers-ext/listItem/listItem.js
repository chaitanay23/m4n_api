const Listitem = require("../../models/list_item");
const fs = require("fs");
const path = require("path");
const formidable = require("formidable");

exports.addListitem = (req, res) => {
  var errors = [];

  new formidable.IncomingForm().parse(req, (err, fields, files) => {
    if (err) console.log(err);

    const title = fields["title"];
    const price = fields["price"];
    const item_code = fields["item_code"];
    const type = fields["type"];
    const finger_limit = fields["finger_limit"];
    const description = fields["description"];

    if (title == null || title == "") errors.push("Name Required");
    if (price == null || price == " ") errors.push("Price Required");
    if (type == null || type == "") errors.push("Type Required");
    if (finger_limit == null || finger_limit == "")
      errors.push("Finger limit Required");

    if (!files["image_url"]) {
      errors.push("Image Required");
    } else {
      if (files["image_url"]) {
        var image_url_path = image(files["image_url"], title, false);
        console.log(image_url_path);
      }

      if (files["brand_imageUrl"]) {
        var brand_image_path = image(files["brand_imageUrl"], title, true);
        console.log(brand_image_path);
      }
    }

    if (errors.length > 0) {
      res.status(400).json({ errors: errors, status: false });
    } else {
      Listitem.create({
        brand_imageUrl: brand_image_path,
        finger_limit: finger_limit,
        imageUrl: image_url_path,
        title: title,
        item_code: item_code,
        price: price,
        type: type,
        description: description
      })
        .then(result => {
          res.status(200).json({
            mesage: "Listitem added sucessfully ",
            status: true
          });
        })
        .catch(err => {
          if (err) res.status(400).json({ err: err, status: false });
        });
    }
  });

  /* helper functions */
  const image = (image, name, isBrand) => {
    console.log(isBrand);
    if (image.type == "image/jpeg" || "image/png") {
      if (errors.length > 0) {
        res.status(400).json({ status: false, errors: errors });
      }
      let extension = path.extname(image.name);
      let oldpath = image.path;
      if (isBrand == true) {
        var newpath = "./images/" + name + "-brand" + extension;
      } else {
        var newpath = "./images/" + name + extension;
      }

      fs.rename(oldpath, newpath, err => {
        if (err) throw err;
      });
      db_path = newpath.slice(1, newpath.length);

      return db_path;
    }
  };
};

exports.getSingleItem = (req, res) => {
  var errors = [];

  new formidable.IncomingForm().parse(req, (err, fields, files) => {
    if (err) console.log(err);
    var id = fields["id"];
    if (id == "" || id == null || id == undefined) errors.push("Provide id");
    console.log(id);
    if (errors.length > 0) {
      res.status(400).json({ errors: errors, status: false });
    } else {
      Listitem.findByPk(id)
        .then(result => {
          if (result) {
            res.status(200).json({ status: true, result: result });
          } else {
            res.status(400).json({ status: false, result: "No Data Found" });
          }
        })
        .catch(err => {
          res.status(400).json({ status: false, error: err });
        });
    }
  });
};

exports.updateProduct = (req, res) => {
  var errors = [];

  new formidable.IncomingForm().parse(req, (err, fields, files) => {
    if (err) console.log(err);
    const id = fields["id"];
    const title = fields["title"];
    const price = fields["price"];
    const item_code = fields["item_code"];
    const type = fields["type"];
    const finger_limit = fields["finger_limit"];
    const description = fields["description"];
    if (id == null || id == "") errors.push("id Required");
    if (title == null || title == "") errors.push("Name Required");
    if (price == null || price == " ") errors.push("Price Required");
    if (type == null || type == "") errors.push("Type Required");
    if (item_code == null || item_code == "") errors.push("item_code Required");
    if (finger_limit == null || finger_limit == "")
      errors.push("Finger limit Required");

    if (files["image_url"]) {
      var image_url_path = image(files["image_url"], title, false);
      console.log(image_url_path);
    }
    if (files["brand_image"]) {
      var brand_image_path = image(files["brand_image"], title, true);
      console.log(brand_image_path);
    }

    if (errors.length > 0) {
      res.status(400).json({ status: false, errors: errors });
    } else {
      Listitem.update(
        {
          brand_imageUrl: brand_image_path,
          finger_limit: finger_limit,
          imageUrl: image_url_path,
          title: title,
          item_code: item_code,
          price: price,
          type: type,
          description: description
        },
        {
          where: {
            id: id
          }
        }
      )
        .then(result => {
          res.status(200).json({
            mesage: "item updated sucessfully ",
            status: true
          });
        })
        .catch(err => {
          if (err) res.status(400).json({ status: false, errors: err });
        });
    }
  });

  /* helper functions */
  const image = (image, name, isBrand) => {
    console.log(isBrand);
    if (image.type == "image/jpeg" || "image/png") {
      if (errors.length > 0) {
        res.status(400).json({ status: false, errors: errors });
      }
      let extension = path.extname(image.name);
      let oldpath = image.path;
      if (isBrand == true) {
        var newpath = "./images/" + name + "-brand" + extension;
      } else {
        var newpath = "./images/" + name + extension;
      }

      fs.rename(oldpath, newpath, err => {
        if (err) res.json({ error: err });
      });
      db_path = newpath.slice(1, newpath.length);

      return db_path;
    }
  };
};

exports.getCount = (req, res) => {
  Listitem.count()
    .then(count => {
      res.status(200).json({ status: true, count: count });
    })
    .catch(err => {
      res.status(400).json({ status: false, error: err });
    });
};

exports.itemsByType = (req, res) => {
  let errors = [];
  new formidable.IncomingForm().parse(req, (err, fields, files) => {
    if (err) console.log(err);

    const type = fields["type"];
    if (type == "" || type == null) errors.push("Provide type");
    if (errors.length > 0) {
      res.json(errors);
    } else {
      Listitem.findAll({
        where: { type: type },
        order: [["updatedAt", "DESC"]],
        attributes: ["id", "title", "imageUrl", "item_code"]
      }).then(items => {
        res.status(200).json({ status: true, items: items });
      });
    }
  });
};
exports.getItems = (req, res) => {
  Listitem.findAll({ order: [["updatedAt", "DESC"]] })
    .then(items => {
      res.status(200).json({ items: items, status: true });
    })
    .catch(err => {
      res.status(400).json({ error: err, status: false });
    });
};
