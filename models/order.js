const Sequelize = require("sequelize");
const sequelize = require("../config");
const Order = sequelize.define("order", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  reference_id: Sequelize.STRING,
  totalPrice: Sequelize.FLOAT,
  totalQuantity: Sequelize.INTEGER,
  status: Sequelize.STRING,
  internalStatus: Sequelize.STRING,
  discountAmount: Sequelize.INTEGER,
  netPayable: Sequelize.FLOAT,
  delivery_charges: Sequelize.INTEGER,
  product_gst_tax: Sequelize.FLOAT,
  delivery_gst_tax: Sequelize.FLOAT,
  comment: Sequelize.TEXT,
  payment_comment: Sequelize.TEXT,
  awb_number: Sequelize.STRING,
  reorder: {
    type: Sequelize.STRING,
    defaultValue: "no"
  }
});
module.exports = Order;
