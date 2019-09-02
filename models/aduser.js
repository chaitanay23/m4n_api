const Sequelize = require('sequelize');

const sequelize = require('../config');

const Aduser = sequelize.define('aduser', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  user_type:Sequelize.STRING,
  name: Sequelize.STRING,
  email: Sequelize.STRING,
  mobileNumber : Sequelize.INTEGER,
  password :{
    type:Sequelize.STRING,
    require:true,
    allowNull:false
  },
  username:Sequelize.STRING

});

module.exports = Aduser;
