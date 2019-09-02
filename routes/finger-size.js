const express=require("express");
const router = express.Router();

const fingerSize = require('../controllers/finger-size/create-controller');
const editSize = require('../controllers/finger-size/edit-controller');
const singleSize = require('../controllers/finger-size/show_single-controller');


router.post('/create',fingerSize.size_check);
router.post('/edit',editSize.size_chnage);
router.post('/show',singleSize.single_size);

module.exports = router;