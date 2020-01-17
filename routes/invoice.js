const express = require("express");
const router = express.Router();

const invoice = require("../controllers/invoice/invoice_pdf-controller");

router.post("/pdf", invoice.generator);

module.exports = router;
