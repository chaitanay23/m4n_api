const Sequelize = require('sequelize');
const sequelize = require('../config');

const Hand_image = sequelize.define('hand-image',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement : true,
        allowNull : false,
        primaryKey : true,
    },
    left_hand_image: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "No_Path"
    },
    right_hand_image: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: "No_Path"
    },
    left_thumb_image: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: "No_Path"
    },
    right_thumb_image: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: "No_Path"
    },
    merged_image:Sequelize.STRING  
});

module.exports = Hand_image;