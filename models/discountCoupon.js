const Sequelize = require('sequelize');
const sequelize = require('../config');

const DiscountCoupon = sequelize.define('discountCoupon',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement : true,
        allowNull : false,
        primaryKey : true,
    },
    name:{
        type: Sequelize.STRING,
    },
    discount_amount: Sequelize.INTEGER,
    type: {
        type: Sequelize.STRING,
    },
    limit_per_user:Sequelize.INTEGER,
    description :{
       type:Sequelize.STRING
    }

});

module.exports = DiscountCoupon;