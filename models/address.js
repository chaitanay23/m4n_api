const Sequelize = require('sequelize');
const sequelize = require('../config');

const Address = sequelize.define('address', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name:Sequelize.STRING,
  mobile:Sequelize.STRING,
  type:Sequelize.STRING,
  state:Sequelize.STRING,
  city: Sequelize.STRING,
  area: Sequelize.STRING,
  zipcode:Sequelize.INTEGER,
  address: {
      type:Sequelize.STRING,
      allowNull: false,
  },
})

module.exports = Address;