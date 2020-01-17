const Sequelize = require("sequelize");

const sequelize = require("../config");

const addCharge = sequelize.define("address-charge", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  zipcode: Sequelize.STRING,
  country: Sequelize.STRING,
  charge: Sequelize.FLOAT
});

module.exports = addCharge;
