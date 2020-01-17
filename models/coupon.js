const Sequelize = require("sequelize");
const sequelize = require("../config");

const Coupon = sequelize.define("coupon", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name: Sequelize.STRING,
  details: Sequelize.JSON,
  description: Sequelize.STRING,
  userLimit: Sequelize.INTEGER,
  dayLimit: Sequelize.INTEGER,
  flag: {
    type: Sequelize.INTEGER,
    defaultValue: 1
  },
  visible: {
    type: Sequelize.INTEGER,
    defaultValue: 1
  }
});

module.exports = Coupon;
