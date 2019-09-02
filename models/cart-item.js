const Sequelize = require('sequelize');
const sequelize = require('../config');

const CartItem = sequelize.define('cartItem', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  quantity: Sequelize.INTEGER,
  finger_id:Sequelize.STRING,
  hand_id:Sequelize.STRING,
  price: Sequelize.INTEGER,
});

module.exports = CartItem;