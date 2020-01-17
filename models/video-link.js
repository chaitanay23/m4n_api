const Sequelize = require("sequelize");
const sequelize = require("../config");

const Video = sequelize.define("video", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name: {
    type: Sequelize.STRING
  },
  description: {
    type: Sequelize.STRING
  },
  thumbnail: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: "No_Path"
  },
  link: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

module.exports = Video;
