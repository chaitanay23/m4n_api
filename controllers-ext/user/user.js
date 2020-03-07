const AdminUser = require("../../models/aduser");
const FactoryUser = require("../../models/factory-user");
const CustomerCare = require("../../models/customer-care");
const Partners = require("../../models/partner");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const User = require("../../models/users");
const fs = require("fs");
const path = require("path");
const formidable = require("formidable");

exports.postAdminUser = (req, res) => {
  let errors = [];
  new formidable.IncomingForm().parse(req, (err, fields, files) => {
    if (err) console.log(err);

    const user_type = fields["user_type"];
    const name = fields["name"];
    const email = fields["email"];
    const mobileNumber = fields["mobileNumber"];
    const password = fields["password"];
    const username = fields["username"];

    if (user_type == "null" || user_type == "")
      errors.push("User Type Required");
    if (name == "null" || name == "") errors.push("Name is Required");
    if (email == "null" || email == "") errors.push("Email is Required");
    if (mobileNumber == "null" || mobileNumber == "")
      errors.push("Mobile Number is required");
    if (password == "null" || password == "")
      errors.push("Password is Required");
    if (username == "null" || username == "")
      errors.push("Username is Required");

    if (errors.length > 0) res.send(JSON.stringify({ errors: errors }));
    else {
      AdminUser.create({
        user_type: user_type,
        name: name,
        email: email,
        mobileNumber: mobileNumber,
        password: password,
        username: username
      })
        .then(result => {
          res.send(
            JSON.stringify({ message: "Admin User Created", status: "200" })
          );
        })
        .catch(err => {
          res.send(JSON.stringify({ errors: err }));
        });
    }
  });
};

exports.login = (req, res) => {
  let errors = [];
  new formidable.IncomingForm().parse(req, (err, fields, files) => {
    if (err) console.log(err);

    const mobile = fields["mobileNumber"];
    const password = fields["password"];

    AdminUser.findOne({
      where: { mobileNumber: mobile },
      attributes: ["name", "password", "email", "username"]
    }).then(user => {
      if (user && user.password == password) {
        res
          .status(200)
          .json({ user: user, message: "Logged in", status: "true" });
      } else {
        res
          .status(400)
          .json({ message: "Credential not correct", status: "false" });
      }
    });
  });
};

exports.getAllUsers = (req, res) => {
  AdminUser.findAll({
    attributes: ["id", "name", "email", "mobileNumber", "username"]
  })
    .then(users => {
      res.status(200).json({ users: users });
    })
    .catch(err => {
      res.status(400).json({ error: err });
    });
};

exports.getFactoryUsers = (req, res) => {
  FactoryUser.findAll({ attributes: ["id", "name", "email", "mobileNumber"] })
    .then(users => {
      res.status(200).json({ users: users });
    })
    .catch(err => {
      res.status(400).json({ error: err });
    });
};

exports.getCustomerCareUsers = (req, res) => {
  CustomerCare.findAll({ attributes: ["id", "name", "email", "mobileNumber"] })
    .then(users => {
      res.status(200).json({ users: users });
    })
    .catch(err => {
      res.status(400).json({ error: err });
    });
};

exports.getPartners = (req, res) => {
  Partners.findAll({ attributes: ["id", "name", "email", "mobile"] })
    .then(users => {
      res.status(200).json({ users: users });
    })
    .catch(err => {
      res.status(400).json({ error: err });
    });
};

exports.getCustCount = (req, res) => {
  User.count({ where: { password: { [Op.ne]: null } } })
    .then(userCount => {
      res.status(200).json({ count: userCount, status: true });
    })
    .catch(err => {
      res.status(400).json({ error: err, status: false });
    });
};
