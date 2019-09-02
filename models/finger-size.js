const Sequelize = require('sequelize');
const sequelize = require('../config');

const Finger_size = sequelize.define('finger-size',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement : true,
        allowNull : false,
        primaryKey : true,
    },
    lf1:Sequelize.INTEGER,
    lf2:Sequelize.INTEGER,
    lf3:Sequelize.INTEGER,
    lf4:Sequelize.INTEGER,
    lf5:Sequelize.INTEGER,
    rf1:Sequelize.INTEGER,
    rf2:Sequelize.INTEGER,
    rf3:Sequelize.INTEGER,
    rf4:Sequelize.INTEGER,
    rf5:Sequelize.INTEGER,
    comment:Sequelize.STRING,
});

module.exports = Finger_size;