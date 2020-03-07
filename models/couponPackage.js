const Sequelize = require("sequelize");
const sequelize = require("../config");

const couponPackage = sequelize.define("couponPackage", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  }
});

module.exports = couponPackage;
