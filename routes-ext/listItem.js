const express = require("express");
const router = express.Router();
const multer = require("multer");

const listItem = require("../controllers-ext/listItem/listItem");

router.post("/addListitem", listItem.addListitem);
router.post("/getItem", listItem.getSingleItem);
router.put("/updateListitem", listItem.updateProduct);
router.post("/getItemByType", listItem.itemsByType);
router.post("/getCount", listItem.getCount);
router.get("/getItems", listItem.getItems);

module.exports = router;
