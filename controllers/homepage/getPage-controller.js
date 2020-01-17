const Homepage = require("../../models/homepage");
const Screen = require("../../models/screen_id");

exports.getHomepage = (_, res) => {
  Homepage.findAll({
    attributes: [
      "id",
      "title",
      "page_title1",
      "page_title2",
      "imageUrl",
      "priority",
      "cta_text"
    ],
    where: {
      flag: 1
    },
    include: [
      {
        model: Screen
      }
    ]
  })
    .then(home_page => {
      return res.json({
        status: "true",
        message: "List of pages",
        pages: home_page
      });
    })
    .catch(err => {
      return res.json({
        status: "false",
        message: "Failure"
      });
    });
};
