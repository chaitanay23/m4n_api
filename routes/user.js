const express=require("express");
const router = express.Router();
const authenticateController = require('../controllers/user/authenticate-controller');
const landingController = require('../controllers/user/landing-controller');
const resetController = require('../controllers/user/reset-controller');
const verfiyController = require('../controllers/user/verify-controller');
const logoutController = require('../controllers/user/logout-controller');
const forgetController = require('../controllers/user/forget_password-controller');
const signupController = require('../controllers/user/sign_up-controller');
const resendOtpController = require('../controllers/user/resend-otp-controller');
const fetchDataController = require('../controllers/user/fetch-data-controller');
const profileUpdate = require('../controllers/user/profile_update-controller');
const sendOtp = require('../controllers/user/send_otp-controller');
const profilePicController = require('../controllers/user/profile_pic-controller');

router.post('/landing',landingController.register);
router.post('/login',authenticateController.authenticate);
router.post('/reset-password',resetController.reset);
router.post('/verify-otp',verfiyController.verification);
router.post('/logout',logoutController.logout);
router.post('/forget-password',forgetController.forget);
router.post('/signup',signupController.signup);
router.post('/resend-otp', resendOtpController.resend);
router.post('/fetch', fetchDataController.fetch);
router.post('/update',profileUpdate.profile_update);
router.post('/send-otp',sendOtp.otp_send);
router.post('/pic-update',profilePicController.pic_update);

module.exports = router;