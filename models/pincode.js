const Sequelize = require("sequelize");
const db = require("../config");

const Pincode = db.define("pincode", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  pincode: {
    type: Sequelize.INTEGER,
    unique: true
  }
});

module.exports = Pincode;
