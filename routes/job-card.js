const express = require("express");
const router = express.Router();

const jobCard = require("../controllers/job-card/card_view-controller");
const orderList = require("../controllers/job-card/order_list-controller");
const statusChange = require("../controllers/job-card/status_change-controller");
const orderCount = require("../controllers/job-card/order_count-controller");
const factoryLogin = require("../controllers/job-card/factory_login-controller");
const factoryLogout = require("../controllers/job-card/factory_logout-controller");
const CSV_logistic = require("../controllers/job-card/logistic_csv-controller");
const card_detail = require("../controllers/job-card/card_detail-controller");
const a5Jobcard = require("../controllers/job-card/card_a5-controller");

router.post("/showcard", jobCard.showJob);
router.post("/orderlist", orderList.showOrder);
router.post("/status-change", statusChange.internal_status);
router.post("/count-order", orderCount.countOrder);
router.post("/factory-login", factoryLogin.authenticate);
router.post("/factory-logout", factoryLogout.logout);
router.post("/logistic-csv", CSV_logistic.generate_csv);
// router.post("/dtdc-csv", CSV_logistic.generate_csv);
router.post("/card-detail", card_detail.jobCardDetail);
router.post("/a5-card", a5Jobcard.jobCardA5);

module.exports = router;
