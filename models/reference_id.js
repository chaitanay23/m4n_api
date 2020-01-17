const Sequelize = require("sequelize");
const sequelize = require("../config");

const Reference_id = sequelize.define("reference_id", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  reference_num: {
    type: Sequelize.STRING
  }
});

module.exports = Reference_id;
