const express=require("express");
const router = express.Router();

const addressCreate = require('../controllers/address/address-controller');
const addressShow = require('../controllers/address/address_get-controller');
const addressEdit = require('../controllers/address/address_edit-controller');
const addressDelivery = require('../controllers/address/address_delivery-controller');
const storeAddress = require('../controllers/address/store_address-controller');
const deleteAddress = require('../controllers/address/address_delete-controller');

router.post('/create',addressCreate.user_address);
router.post('/show',addressShow.show_address);
router.post('/edit',addressEdit.edit_address);
router.post('/delivery-charge',addressDelivery.charge);
router.post('/store-address',storeAddress.store_address);
router.post('/delete-address',deleteAddress.delete_address);

module.exports = router;