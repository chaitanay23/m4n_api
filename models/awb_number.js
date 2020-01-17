const Sequelize = require("sequelize");
const sequelize = require("../config");

const Awb_number = sequelize.define("awb_number", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  awb_number: {
    type: Sequelize.STRING
  }
});

module.exports = Awb_number;
