const Sequelize = require("sequelize");
const sequelize = require("../config");

const Store = sequelize.define("store", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  store_name: Sequelize.STRING,
  owner_name: Sequelize.STRING,
  mobile: Sequelize.STRING,
  state: Sequelize.STRING,
  city: Sequelize.STRING,
  area: Sequelize.STRING,
  address: Sequelize.STRING,
  zipcode: Sequelize.INTEGER,
  delivery_charges: Sequelize.INTEGER
});

module.exports = Store;
