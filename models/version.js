const Sequelize = require("sequelize");
const sequelize = require("../config");

const Version = sequelize.define("version", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  ios: Sequelize.STRING,
  android: Sequelize.STRING,
  android_ar: Sequelize.STRING,
  status: Sequelize.INTEGER
});

module.exports = Version;
