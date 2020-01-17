const Order = require("../../models/order");
const fs = require("fs");
const path = require("path");
const formidable = require("formidable");
const sequelize = require("sequelize");
const Op = sequelize.Op;

exports.countOrders = (req, res) => {
  Order.count({
    where: {
      [Op.and]: [
        {
          internalStatus: {
            [Op.ne]: "pending"
          }
        },
        {
          internalStatus: {
            [Op.ne]: "failed"
          }
        }
      ]
    }
  })
    .then(ordersCount => {
      res.status(200).json({
        count: ordersCount,
        status: true
      });
    })
    .catch(err => {
      res.status(400).json({
        error: err,
        status: false
      });
    });
};

exports.calRevenue = (rea, res) => {
  Order.sum("netPayable", {
    where: {
      [Op.and]: [
        {
          internalStatus: {
            [Op.ne]: "pending"
          }
        },
        {
          internalStatus: {
            [Op.ne]: "failed"
          }
        }
      ]
    }
  })
    .then(revenue => {
      res.status(200).json({
        total: revenue,
        status: true
      });
    })
    .catch(err => {
      res.status(400).json({
        error: err,
        status: false
      });
    });
};

exports.getGraphDetails = (req, res) => {
  let errors = [];
  new formidable.IncomingForm().parse(req, (err, fields, fiels) => {
    let year = fields["year"];
    if (year == "" || year == null) errors.push("Provide Year");
    let raw_qry =
      "select MONTHNAME(createdAt) AS `name`,MONTH(createdAt) AS `month`,YEAR(createdAt) AS `year`,COUNT(id) AS `total` FROM `orders` WHERE YEAR(createdAt) = (?) GROUP BY MONTHNAME(createdAt) DESC, MONTH(createdAt), YEAR(createdAt) ";
    Order.sequelize
      .query(raw_qry, {
        type: sequelize.QueryTypes.SELECT,
        replacements: [year]
      })
      .then(response => {
        if (response) {
          res.json({
            data: response,
            status: true
          });
        }
      })
      .catch(err => {
        res.json({
          error: err,
          status: false
        });
      });
  });
};

exports.getCurrentOrders = (req, res) => {
  let errors = [];
  let raw_query =
    "Select COUNT(Id) as Count from orders where internalStatus != 'pending' and internalStatus != 'failed' and Date(updatedAt) = CURDATE()";

  Order.sequelize
    .query(raw_query, {
      type: sequelize.QueryTypes.SELECT
    })
    .then(response => {
      res.json({
        data: response
      });
    });
};
