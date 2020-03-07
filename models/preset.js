const Sequelize = require("sequelize");
const sequelize = require("../config");

const Preset = sequelize.define("preset", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name: Sequelize.STRING,
  image: { type: Sequelize.STRING, allowNull: false },
  images: Sequelize.TEXT,
  lf1: Sequelize.STRING,
  lf2: Sequelize.STRING,
  lf3: Sequelize.STRING,
  lf4: Sequelize.STRING,
  lf5: Sequelize.STRING,
  rf1: Sequelize.STRING,
  rf2: Sequelize.STRING,
  rf3: Sequelize.STRING,
  rf4: Sequelize.STRING,
  rf5: Sequelize.STRING,
  description: {
    type: Sequelize.STRING,

    defaultValue: ""
  },
  hot_selling: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  new: {
    type: Sequelize.INTEGER,
    defaultValue: 1
  }
});

module.exports = Preset;
