const Sequelize = require("sequelize");
const sequelize = require("../config");

const CartItem = sequelize.define("cartItem", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  lf1: Sequelize.JSON,
  lf2: Sequelize.JSON,
  lf3: Sequelize.JSON,
  lf4: Sequelize.JSON,
  lf5: Sequelize.JSON,
  rf1: Sequelize.JSON,
  rf2: Sequelize.JSON,
  rf3: Sequelize.JSON,
  rf4: Sequelize.JSON,
  rf5: Sequelize.JSON,
  price: Sequelize.FLOAT,
  preview_image: Sequelize.STRING
});

module.exports = CartItem;
