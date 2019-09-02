const express=require("express");
const router = express.Router();

const jobCard = require('../controllers/job-card/card_view-controller');
const orderList = require('../controllers/job-card/order_list-controller');
const statusChange = require('../controllers/job-card/status_change-controller');
const orderCount = require('../controllers/job-card/order_count-controller');
const factoryLogin = require('../controllers/job-card/factory_login-controller');
const factoryLogout = require('../controllers/job-card/factory_logout-controller');

router.post('/showcard',jobCard.showJob);
router.post('/orderlist',orderList.showOrder);
router.post('/status-change',statusChange.internal_status);
router.post('/count-order',orderCount.countOrder);
router.post('/factory-login',factoryLogin.authenticate);
router.post('/factory-logout',factoryLogout.logout);

module.exports = router;