const Order = require("../../models/order");
const User = require("../../models/users");
const Address = require("../../models/address");
const Finger = require("../../models/finger-size");
const Payment = require("../../models/payment");
const Cart = require("../../models/cart");
const Cart_item = require("../../models/cart-item");
const Package = require("../../models/package");
const Accessories = require("../../models/accessories");
const ListItems = require("../../models/list_item");
const Design = require("../../models/design-image");
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

exports.getAllOrders = (req, res) => {
  Order.findAll({

    order: [["updatedAt", "DESC"]],
    attributes: [
      "id",
      "reference_id",
      "netPayable",
      "status",
      "internalStatus",
      "awb_number"
    ],
    include: [
      {
        model: User
      }
    ],
    order: [["createdAt", "DESC"]]
  })
    .then(orders => {
      res.status(200).json({
        status: true,
        orders: orders
      });
    })
    .catch(err => {
      res.status(400).json({
        status: false,
        error: err
      });
    });
};

exports.getSingleOrder = (req, res) => {
  new formidable.IncomingForm().parse(req, (err, fields, files) => {
    const id = fields["id"];

    Order.findByPk(id, {
      attributes: [
        "id",
        "userId",
        "reference_id",
        "netPayable",
        "status",
        "internalStatus",
        "cartID",
        "awb_number",
        "discountAmount",
        "delivery_charges",
        "product_gst_tax",
        "delivery_gst_tax"
      ],
      include: [
        {
          model: User,
          attributes: ["name", "email", "mobileNumber"]
        },
        {
          model: Address,
          attributes: {
            exclude: ["createdAt", "updatedAt", "userId"]
          }
        },
        {
          model: Finger,
          as: "finger"
        },
        {
          model: Payment
        },
        {
          model: Cart,
          attributes: ["id", "totalPackage", "totalItems"],
          include: [
            {
              model: Cart_item,
              attributes: ["id", "preview_image"],
              include: [
                {
                  model: Package,
                  attributes: ["id", "name", "description"]
                },
                {
                  model: Accessories
                }
              ]
            }
          ]
        }
      ]
    })
      .then(order => {
        res.status(200).json({
          status: true,
          order: order
        });
      })
      .catch(err => {
        res.status(400).json({
          status: false,
          error: err
        });
      });
  });
};
