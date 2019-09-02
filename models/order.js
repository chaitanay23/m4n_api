const Sequelize = require('sequelize');
const sequelize = require('../config');

const Order = sequelize.define('order', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  totalPrice:Sequelize.FLOAT,
  totalQuantity:Sequelize.INTEGER,
  status:Sequelize.STRING,
  internalStatus:Sequelize.STRING,
  coupon:Sequelize.STRING,
  discountAmount:Sequelize.INTEGER,
  netPayable:Sequelize.FLOAT,
  delivery_charges:Sequelize.INTEGER,
  delivery_discount:Sequelize.INTEGER,
  product_gst_tax:Sequelize.FLOAT,
  delivery_gst_tax:Sequelize.FLOAT,
  comment:Sequelize.TEXT
});

module.exports = Order;
