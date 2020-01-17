const Sequelize = require("sequelize");

const sequelize = require("../config");

const Package = sequelize.define("package", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  price: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  page_title1: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: ""
  },
  page_title2: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: ""
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false
  },
  colors: {
    type: Sequelize.JSON
  },
  customization: {
    type: Sequelize.JSON
  },
  fancy_nail_qty: {
    type: Sequelize.INTEGER
  },
  flag: {
    type: Sequelize.INTEGER,
    defaultValue: 1
  },
  offer: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  imageUrl: {
    type: Sequelize.STRING
  },
  cta_text: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: ""
  }
});

module.exports = Package;
