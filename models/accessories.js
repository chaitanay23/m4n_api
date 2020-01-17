const Sequelize = require("sequelize");
const sequelize = require("../config");

const Accessories = sequelize.define("accessories", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name: Sequelize.STRING,
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
    type: Sequelize.STRING,
    allowNull: false
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false
  },
  flag: Sequelize.INTEGER
});

module.exports = Accessories;
