const Sequelize = require("sequelize");
const db = require("../config");

const Screen = db.define("screen", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name: Sequelize.STRING,
  description: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: ""
  }
});

module.exports = Screen;
