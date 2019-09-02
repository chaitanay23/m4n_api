const Sequelize = require('sequelize');
const sequelize = require('../config');

const Wishlist = sequelize.define('wishlist',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement : true,
        allowNull : false,
        primaryKey : true,
    },

});

module.exports = Wishlist;