const Sequelize = require("sequelize");

const sequelize = require("../config");

const Homepage = sequelize.define("homepage", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  title: {
    type: Sequelize.STRING,
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
  cta_text: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: ""
  },
  imageUrl: {
    type: Sequelize.STRING,
    allowNull: false
  },
  priority: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  flag: {
    type: Sequelize.INTEGER,
    defaultValue: 1
  }
});
module.exports = Homepage;
