const Sequelize = require("sequelize");
const sequelize = require("../config");

const Cart = sequelize.define("cart", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  status: Sequelize.INTEGER,
  totalPrice: Sequelize.FLOAT,
  totalPackage: Sequelize.INTEGER,
  totalItems: Sequelize.INTEGER
});

module.exports = Cart;
