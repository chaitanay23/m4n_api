const Accessories = require("../../models/accessories");

exports.getAccessories = (_, res) => {
  Accessories.findAll({
    attributes: ["id", "name", "price", "imageUrl"],
    where: { flag: 1 }
  })
    .then(kit => {
      return res.json({
        status: "true",
        message: "List of package",
        accessories: kit
      });
    })
    .catch(err => {
      return res.json({
        status: "false",
        message: "Failure"
      });
    });
};
