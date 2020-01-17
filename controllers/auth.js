const Aduser = require("../models/aduser");
const bcrypt = require("bcryptjs");

exports.getLogin = (req, res, next) => {
  //    const isloggedin = req.get('Cookie').split(';')[2].trim().split('=')[1];
  console.log(req.session.isLoggedIn);
  res.render("auth/login", {
    path: "/login",
    isAuthenticated: false
  });
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    isAuthenticated: req.session.isLoggedIn
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  Aduser.findAll({ where: { email: email } })
    .then(user => {
      req.session.isLoggedIn = true;
      req.session.aduser = user;

      hashPassword = user[0].dataValues.password;

      if (user.length < 0) {
        return res.redirect("/login");
      }
      bcrypt
        .compare(password, hashPassword)
        .then(doMatch => {
          console.log(doMatch);
          if (doMatch) {
            req.session.isLoggedIn = true;
            // req.session.user = user;

            return res.redirect("/");
          }
          res.redirect("/login");
        })
        .catch(err => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect("/login");
  });
};

exports.postUsers = (req, res, next) => {
  console.log("$$$$$$$44444");
  console.log(req.body);
  const email = req.body.email;
  const name = req.body.name;
  const mobileNumber = req.body.mobileNumber;
  const user_type = req.body.user_type;
  const username = req.body.username;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  Aduser.findAll({ where: { email: email } })
    .then(user => {
      if (user.length > 0) {
        console.log(user);
        return res.redirect("/signup");
      }
      return bcrypt.hash(password, 12);
    })
    .then(hashedPassword => {
      return Aduser.create({
        email: email,
        name: name,
        password: hashedPassword,
        mobileNumber: mobileNumber,
        user_type: user_type,
        username: username
      })
        .then(result => {
          console.log("its here", result);
          res.redirect("/login");
        })
        .catch(err => {
          console.log(err);
        });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProducts = (req, res, next) => {
  req.aduser
    .getProducts()
    .then(products => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
        isAuthenticated: true
      });
    })
    .catch(err => console.log(err));
};

exports.getAllUsers = (req, res, next) => {
  Aduser.findAll()
    .then(users => {
      res.render("auth/users", {
        users: users,
        pageTitle: "Users",
        path: "/auth/users",
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => {
      console.log(err);
    });
};
