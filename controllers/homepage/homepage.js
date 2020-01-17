const Homepage = require("../../models/homepage");
const fs = require("fs");
const path = require("path");
const formidable = require("formidable");

exports.addHomePage = (req, res) => {
  var errors = [];

  new formidable.IncomingForm().parse(req, (err, fields, files) => {
    const title = fields["title"];
    const description = fields["description"];
    const button_text = fields["button_text"];
    const priority = fields["priority"];

    if (title == null || title == " ") errors.push("Title not provided");
    if (description == null || description == "")
      errors.push("description not provided");
    if (button_text == null || button_text == " ")
      errors.push("Button text not provided");
    if (!files["imageUrl"]) {
      errors.push("Image not provided");
    } else {
      var imagePath = image(files["imageUrl"], title, false);
    }

    if (errors.length > 0) {
      res.json({ errors: errors });
    } else {
      Homepage.create({
        title: title,
        description: description,
        button_text: button_text,
        imageUrl: imagePath,
        priority: priority
      })
        .then(response => {
          res.status(200).json({ status: true, message: "Homepage added" });
        })
        .catch(err => {
          res.json({ error: err });
        });
    }
  });
  const image = (image, name) => {
    if (image.type == "image/jpeg" || "image/png") {
      if (errors.length > 0) {
        res.send(JSON.stringify(errors));
      }
      let extension = path.extname(image.name);
      let oldpath = image.path;
      var newpath = "./homepage/" + name + extension;

      fs.rename(oldpath, newpath, err => {
        if (err) throw err;
      });
      db_path = newpath.slice(1, newpath.length);

      return db_path;
    }
  };
};

/* helper functions */
