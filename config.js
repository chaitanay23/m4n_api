const Sequelize = require("sequelize");

const sequelize = new Sequelize("candy", "phpmyadmin", "tepl@123", {
  dialect: "mysql",
  host: "localhost"
});

module.exports = sequelize;
