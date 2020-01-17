const Sequelize = require("sequelize");

const sequelize = require("../config");

const ListItem = sequelize.define("list_item", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  title: Sequelize.STRING,
  price: {
    type: Sequelize.DOUBLE,
    allowNull: false
  },
  item_code: Sequelize.STRING,
  type: Sequelize.STRING,
  imageUrl: {
    type: Sequelize.STRING,
    allowNull: false
  },
  brand_imageUrl: {
    type: Sequelize.STRING
  },
  finger_limit: {
    type: Sequelize.INTEGER,
    defaultValue: 12
  },
  description: {
    type: Sequelize.STRING
  }
});

module.exports = ListItem;
