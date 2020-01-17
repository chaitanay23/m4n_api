const Sequelize = require("sequelize");
const db = require("../config");

const State = db.define("state", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  state: {
    type: Sequelize.STRING,
    unique: true
  }
});

module.exports = State;
