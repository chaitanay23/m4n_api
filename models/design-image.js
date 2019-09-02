const Sequelize = require('sequelize');
const sequelize = require('../config');

const Design_image = sequelize.define('design-image',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement : true,
        allowNull : false,
        primaryKey : true,
    },
    left_hand_design:{
        type: Sequelize.STRING,
        allowNull: false
    },
    right_hand_design:{
        type: Sequelize.STRING,
        allowNull: false
    },

});

module.exports = Design_image;