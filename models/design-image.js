const Sequelize = require("sequelize");
const sequelize = require("../config");

const Design_image = sequelize.define("design-image", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  lf1: {
    type: Sequelize.STRING,
    allowNull: false
  },
  lf2: {
    type: Sequelize.STRING,
    allowNull: false
  },
  lf3: {
    type: Sequelize.STRING,
    allowNull: false
  },
  lf4: {
    type: Sequelize.STRING,
    allowNull: false
  },
  lf5: {
    type: Sequelize.STRING,
    allowNull: false
  },
  rf1: {
    type: Sequelize.STRING,
    allowNull: false
  },
  rf2: {
    type: Sequelize.STRING,
    allowNull: false
  },
  rf3: {
    type: Sequelize.STRING,
    allowNull: false
  },
  rf4: {
    type: Sequelize.STRING,
    allowNull: false
  },
  rf5: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

module.exports = Design_image;
