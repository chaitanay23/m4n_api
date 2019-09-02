const express=require("express");
const router = express.Router();

const loginController = require('../controllers/customerCare/login-controller');
const logoutController = require('../controllers/customerCare/logout-controller');
const orderDetailController = require('../controllers/customerCare/get_order-controller');
const userDetailController = require('../controllers/customerCare/get_user-controller');
const reorderController = require('../controllers/customerCare/reorder-controller');
const fingerUpdateController = require('../controllers/customerCare/update_finger');

router.post('/login',loginController.authenticate);
router.post('/logout',logoutController.logout);
router.post('/order-detail',orderDetailController.orderDetail);
router.post('/user-detail',userDetailController.UserDetail);
router.post('/reorder',reorderController.process_reorder);
router.post('/update-finger',fingerUpdateController.update_size);


module.exports = router;