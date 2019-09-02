const Sequelize = require('sequelize');
const sequelize = require('../config');

const Users = sequelize.define('users',{
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
    DOB: Sequelize.STRING,
    specialDate: Sequelize.STRING,
    otp: Sequelize.STRING,
    referal_code: Sequelize.STRING,
    referee:Sequelize.STRING,
    profile_pic: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "No_Path"
        },
});

module.exports = Users;