const Sequelize = require("sequelize");
const db = require("../config");

const Partner = db.define("partner", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name: Sequelize.STRING,
  email: Sequelize.STRING,
  mobile: Sequelize.STRING,
  password: {
    type: Sequelize.STRING,
    allowNull: false,
    require: true
  }
});

module.exports = Partner;
