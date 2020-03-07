const Package = require("../../models/package");

exports.getPackages = (_, res) => {
  Package.findAll({
    attributes: [
      "id",
      "name",
      "imageUrl",
      "display_price",
      "price",
      "offer",
      "cta_text",
      "page_title1",
      "page_title2"
    ],
    where: {
      flag: 1
    }
  })
    .then(packages => {
      let offer = [];
      let non_offer = [];
      packages.forEach(item => {
        if (item.offer == 1) {
          offer.push(item);
        } else {
          non_offer.push(item);
        }
      });
      return res.json({
        status: "true",
        message: "List of package",
        Offer_package: offer,
        Snapon_package: non_offer
      });
    })
    .catch(err => {
      return res.json({
        status: "false",
        message: "Failure"
      });
    });
};
