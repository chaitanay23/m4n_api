const Sequelize = require("sequelize");
const sequelize = require("../config");

const KioskUsers = sequelize.define("kioskUser", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name: {
    type: Sequelize.STRING
  },
  email: Sequelize.STRING,
  mobileNumber: {
    type: Sequelize.STRING,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING
  },
  otp: {
    type: Sequelize.INTEGER
  }
});

module.exports = KioskUsers;
