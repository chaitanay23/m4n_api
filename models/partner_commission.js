const Sequelize = require("sequelize");
const db = require("../config");

const PartnerCommission = db.define("partnerCommission", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  percentage: Sequelize.FLOAT
});

module.exports = PartnerCommission;
