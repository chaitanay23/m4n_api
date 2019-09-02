const multer = require('multer');

const storage = multer.diskStorage({
  destination: function(req,res,cb){
   cb(null,'./images');
  },
  filename:function(req,file,cb){
   cb(null,file.originalname);
  }
});

const  uploads = multer({storage:storage});

const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', adminController.getAddProduct);

router.get('/edit-product/:productId', adminController.getEditProduct);

// /admin/products => GET
router.get('/products', adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product',uploads.single('imageUrl'), adminController.postAddProduct);

router.post('/edit-product', adminController.postEditProduct);

router.post('/delete-product', adminController.postDeleteProduct);

router.post('/typeProducts',adminController.getProductype);

router.post('/store',adminController.postStore);

router.post('/add-kioskUser',adminController.postKioskUsers);

router.post('/add-coupons',adminController.postDiscountCoupon);

router.get('/add-store',adminController.getStore);

router.get('/allStores',adminController.getAllStores);

router.get('/allUsers',adminController.getAllUsers);

router.get('/allOrders',adminController.getAllOrders);

router.get('/add-kiosk',adminController.getKioskUsers );    

router.get('/kioskUsers',adminController.getAllKiosks);

router.get('/add-coupons',adminController.getCouponPage) ;





module.exports = router;