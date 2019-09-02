const Product = require('../models/product');
const Store = require('../models/store');
const User = require('../models/users');
const Orders = require('../models/order');
const kioskUser = require('../models/kioskUser');
const bcrypt = require('bcryptjs');
const discountCoupon = require('../models/discountCoupon');




exports.getAddProduct = (req, res, next) => {
 res.render('admin/edit-product', {
   pageTitle: 'Add Product',
   path: '/admin/add-product',
   editing: false,
   isAuthenticated:req.session.isLoggedIn

 });
};


exports.postAddProduct = (req, res, next) => {
 const title = req.body.title;
 const imageUrl = req.file.path;
 const price = req.body.price;
 const description = req.body.description;
 const quantity= req.body.quantity;
 const product_code = req.body.product_code;
 const product_type = req.body.product_type;

 console.log(req);

 req.aduser.createProduct({
     title: title,
     price: price,
     imageUrl: imageUrl,
     quantity:quantity,
     product_code:product_code,
     product_type:product_type,
     description: description
   })
   .then(result => {
     // console.log(result);
     console.log('Created Product');
     res.redirect('/admin/products');
   })
   .catch(err => {
     console.log(err);
   });
};

exports.getEditProduct = (req, res, next) => {
 const editMode = req.query.edit;
 if (!editMode) {
   return res.redirect('/');
 }
 const prodId = req.params.productId;
 req.aduser
   .getProducts({ where: { id: prodId } })
   // Product.findById(prodId)
   .then(products => {
     const product = products[0];
     if (!product) {
       return res.redirect('/');
     }
     res.render('admin/edit-product', {
       pageTitle: 'Edit Product',
       path: '/admin/edit-product',
       editing: editMode,
       product: product,
       isAuthenticated:req.session.isLoggedIn

     });
   })
   .catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
 const prodId = req.body.productId;
 const updatedTitle = req.body.title;
 const updatedPrice = req.body.price;
 const updatedImageUrl = req.body.image;
 const updatedDesc = req.body.description;
 Product.findByPk(prodId)
   .then(product => {
     product.title = updatedTitle;
     product.price = updatedPrice;
     product.description = updatedDesc;
     product.imageUrl = updatedImageUrl;
     return product.save();
   })
   .then(result => {
     console.log('UPDATED PRODUCT!');
     res.redirect('/admin/products');
   })
   .catch(err => console.log(err));
};

exports.getProducts = (req, res, next) => {
 console.log(req.aduser);
 req.aduser
   .getProducts()
   .then(products => {
     res.render('admin/products', {
       prods: products,
       pageTitle: 'Admin Products',
       path: '/admin/products',
       isAuthenticated:req.session.isLoggedIn
     });
   })
   .catch(err => console.log(err));
};


exports.getProductype = (req,res) => {
 product_type = req.body.product_type;
 console.log(product_type);
 Product.findAll({where:{product_type:product_type}}).then(prods=>{
   if(prods.length>0){
     return res.status(201).send({
       status:'true',
       prods
     })

   }else{
     return res.status(400).send({
       status:'false',
       message:'No products found'
     })
   }
   }).catch(err=>{
   console.log(err);
 })

};


exports.postDeleteProduct = (req, res, next) => {
 const prodId = req.body.productId;
 Product.findByPk(prodId)
   .then(product => {
     return product.destroy();
   })
   .then(result => {
     console.log('DESTROYED PRODUCT');
     res.redirect('/admin/products');
   })
   .catch(err => console.log(err));
};

exports.getStore = (req,res,next)=>{
  res.render('admin/store',{
    pageTitle:'Add Store',
    path:'/amdin/add-store',
    editing:false,
    isAuthenticated:req.session.isLoggedIn
  });
}

exports.postStore = (req,res,next) =>{
  const store_name = req.body.store_name;
 const owner_name = req.body.owner_name;
 const state = req.body.state;
 const city = req.body.city;
 const area = req.body.area;
 const address = req.body.address;
 const zipcode = req.body.zipcode;
 const delivery_charges = req.body.delivery_charges;

Store.create({
  store_name:store_name,
  owner_name:owner_name,
  state:state,
  city:city,
  area:area,
  address:address,
  zipcode:zipcode,
  delivery_charges:delivery_charges,
  }).then(result =>{
    res.redirect('/admin/allStores'); 
  }).catch(err =>{
    console.log(err);
  });

}

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    isAuthenticated:req.session.isLoggedIn
 
  });
 };

 exports.getAllStores = (req,res,next) =>{
   Store.findAll().then(stores =>{
     res.render('admin/edit-store',{
       stores:stores,
       pageTitle:'Stores',
       path:'admin/stores',
       editing:false,
       isAuthenticated:req.session.isLoggedIn
     })
   }).catch(err =>{
     console.log(err);
   });
 }

 exports.getAllUsers = (req,res,next) =>{
  User.findAll().then(users =>{
      res.render('admin/edit-user',{
      users:users,
      pageTitle:'Users',
      path:'admin/users',
      editing:false,
      isAuthenticated:req.session.isLoggedIn
    })
  }).catch(err =>{
    console.log(err);
  });

 }
 
 exports.getAllOrders = (req,res,next) =>{
  Orders.findAll().then(orders =>{
      res.render('admin/order',{
      orders:orders,
      pageTitle:'Orders',
      path:'admin/orders',
      editing:false,
      isAuthenticated:req.session.isLoggedIn
    })
  }).catch(err =>{
    console.log(err);
  });

 }

 exports.getKioskUsers = (req,res,next) =>{
 res.render('admin/kiosk',{
    pageTitle:'kioskUsers',
    path:'admin/kiosk',
    editing:false,
    isAuthenticated:req.session.isLoggedIn
  });
}

exports.postKioskUsers = (req,res,next) =>{
  const name = req.body.name;
  const email = req.body.email;
  const mobileNumber = req.body.mobileNumber;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  

  kioskUser.findAll({where:{email:email}}).then(user =>{
    if(user.length > 0){
      res.redirect('/admin/add-kiosk');
    }
    return bcrypt.hash(password,12);
  }).then(hashedPassword =>{
    return kioskUser.create({
      name:name,
      email:email,
      mobileNumber:mobileNumber,
      password:hashedPassword
    }).then(result =>{

      res.redirect('/admin/kioskUsers');

    }).catch(err =>{
      console.log(err)
    });
    
  }).catch(err =>{
    console.log(err);
  });
}

exports.getAllKiosks = (req,res,next) =>{
  kioskUser.findAll().then(kiosks =>{

    res.render('admin/edit-kiosk',{
      kiosks:kiosks,
      pageTitle:'kiosks',
      path:'admin/kiosk',
      editing:false,
      isAuthenticated:req.session.isLoggedIn

    })
  }).catch(err =>{
    console.log(err);
  });

}

exports.getCouponPage = (req,res,next) =>{
  res.render('admin/edit-discountCoupon',{
    pageTitle:'coupons',
    path:'admin/coupons',
    editing:false,
    isAuthenticated:req.session.isLoggedIn
  });
}

exports.postDiscountCoupon = (req,res,next) =>{
  console.log(req.body);
  const name = req.body.name;
  const discount_amount = req.body.discount_amount;
  const delivery_charges = req.body.delivery_charges;
  const type = req.body.type;
  const limit_per_user = req.body.limit_per_user;
  const description = req.body.description;

  discountCoupon.create({
  name:name,
  discount_amount:discount_amount,
  delivery_charges:delivery_charges,
  type:type ,
  limit_per_user:limit_per_user,
  description:description
  }).then(result =>{
    res.redirect('/');
  }).catch(err =>{
    console.log(err);
  });


  


}