const Sequelize = require("sequelize");
const db = require("../config");

const Sale = db.define("sale", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  commission_amount: Sequelize.FLOAT
});

module.exports = Sale;
