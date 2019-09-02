const Sequelize = require('sequelize');
const sequelize = require('../config');

const Payment = sequelize.define('payment',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement : true,
        allowNull : false,
        primaryKey : true,
    },
    tracking_id:Sequelize.BIGINT,
    amount:Sequelize.INTEGER,
    currency:Sequelize.STRING,
    bank_ref_no:Sequelize.BIGINT,    
    payment_mode:Sequelize.STRING,
    card_number:Sequelize.STRING,
    order_status:Sequelize.STRING,
    status_message:Sequelize.STRING,
    status_code:Sequelize.STRING,
    comment:Sequelize.STRING,
});


module.exports = Payment;
