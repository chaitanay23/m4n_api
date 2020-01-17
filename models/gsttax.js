const Sequelize = require("sequelize");
const sequelize = require("../config");

const Gsttax = sequelize.define("gsttax", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  tax: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
});

module.exports = Gsttax;
