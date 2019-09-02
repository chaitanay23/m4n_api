const Sequelize = require('sequelize');
const sequelize = require('../config');

const Factory = sequelize.define('factory-users',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement : true,
        allowNull : false,
        primaryKey : true,
    },
    name:{
        type: Sequelize.STRING,
    },
    email: Sequelize.STRING,
    mobileNumber: {
        type: Sequelize.STRING,
        allowNull : false,
    },
    password: {
        type: Sequelize.STRING,
    },
});

module.exports = Factory;