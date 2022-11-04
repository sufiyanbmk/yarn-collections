const { compareSync } = require("bcrypt");
var express = require("express");
const {
  RecordingRulesInstance,
} = require("twilio/lib/rest/video/v1/room/roomRecordingRule");
const { response } = require("../app");
const { Category } = require("../config/collection");
const adminHelper = require("../helpers/adminHelper");
const orderHelper = require("../helpers/orderHelper");
const store = require("../middleware/multer");
const { route } = require("./user");
var router = express.Router();

var auth = function (req, res, next) {
  if (req.session.adminlogedIn) {
    next();
  } else {
    res.redirect("/admin");
  }
};

const adminDb = "admin";
const passwordDb = "123";

/* GET users listing. */
router.get("/", function (req, res, next) {
  if (req.session.adminlogedIn) {
    res.render("adminSide/adminPannel");
  } else {
    res.render("adminSide/adminlogin", { error: req.session.validation });
    req.session.validation = false;
  }
});

router.post("/adminLogin", function (req, res, next) {
  var admin = req.body.admin;
  var password = req.body.password;
  if (admin === adminDb && password === passwordDb) {
    req.session.adminlogedIn = true;
    res.redirect("/admin/dashboard");
  } else {
    console.log("incoore");
    req.session.validation = "Invalid username or password";
    res.redirect("/admin");
  }
});

router.get("/dashboard", (req, res) => {
  res.render("adminSide/adminPannel");
});

//category

router.get("/categorymange", (req, res) => {
  adminHelper.viewCategories().then((Category) => {
    res.render("adminSide/categoryManagement", { Category });
  });
});

router.get("/addCategory", (req, res) => {
  res.render("adminSide/addCategory");
});

router.get("/backCategory", (req, res) => {
  res.redirect("/admin/categorymange");
});

router.post("/addCategory", (req, res) => {
  adminHelper.addCategories(req.body).then((Categorylist) => {
    res.redirect("/admin/categorymange");
  });
});

router.get("/edit/:id", async (req, res) => {
  let catagorydetail = await adminHelper.getCategoryDetails(req.params.id);
  res.render("adminSide/editCategory", { catagorydetail });
});

router.post("/updateCategory/:id", (req, res) => {
  adminHelper.updatedCategory(req.params.id, req.body).then((updatedlist) => {
    res.redirect("/admin/categorymange");
  });
});

router.get("/delete/:id", (req, res) => {
  adminHelper.deletecategory(req.params.id).then((deletelist) => {
    res.redirect("/admin/categorymange");
  });
});

//products

router.get("/productmange", (req, res) => {
  adminHelper.viewProduct().then((product) => {
   
    res.render("adminSide/productManagement", { product });
  });
});

router.get("/addProduct", (req, res) => {
  adminHelper.viewCategories().then((Categorylist) => {
    res.render("adminside/addProduct", { Categorylist });
  });
});

router.get("/backProduct", (req, res) => {
  res.redirect("/admin/productmange");
});

router.post("/addProduct", store.array("image", 4), (req, res, next) => {
  const loc = req.files.map(filename);
  function filename(file) {
    return file.filename;
  }
  let productDetails = req.body;
  productDetails.imagefileName = loc;
  adminHelper.addProduct(productDetails).then((productDetails) => {
    res.redirect("/admin/productmange");
  });
  //   const files = req.files;
  // if(!files){
  //   const error = new Error('please choose file')
  //   error.httpStatusCode = 400;
  //   return next(error)
  // }

  // res.redirect('/admin/productmange')
  // let image = req.files.image
  // image.mv('./public/product-images/'+id+'.jpg',(err)=>{
  //   if(!err){
  //      res.redirect('/admin/productmange')
  //   }
  //   else{
  //     console.log(err)
  //     res.redirect('/admin/productmange')
  //   }
  // })
  // })
});

router.get("/editProducts/:id", async (req, res) => {
  await adminHelper.getProduct(req.params.id).then((product) => {
    adminHelper.viewCategories().then((Categorylist) => {
      res.render("adminSide/editProduct", { product, Categorylist });
    });
  });
});

router.post("/editProduct/:id", store.array("image", 3), (req, res) => {
  const loc = req.files.map(filename);
  function filename(file) {
    return file.filename;
  }
  let productDetails = req.body;
  productDetails.imagefileName = loc;
  adminHelper
    .updateProduct(req.params.id, productDetails)
    .then((productDetails) => {
      res.redirect("/admin/productmange");
    });
});

router.get("/deleteProducts/:id", (req, res) => {
  adminHelper.deleteProduct(req.params.id).then((response) => {
    res.redirect("/admin/productmange");
  });
});

//customer

router.get("/usermange", (req, res) => {
  adminHelper.viewUser().then((users) => {
    res.render("adminSide/userMangement", {
      users,
      activated: req.session.active,
    });
  });
});
//block user 
router.get("/banned/:id", (req, res) => {
  adminHelper.banUser(req.params.id).then((response) => {
    if (response) {
      res.redirect("/admin/usermange");
    }
  });
});
//unblock user

router.get("/unbanned/:id", (req, res) => {
  adminHelper.unbanUser(req.params.id).then((response) => {
    if (response) {
      res.redirect("/admin/usermange");
    }
  });
});
//order mangament

router.get("/order-management", (req, res) => {
  orderHelper.adminorderlist().then((order) => {

    res.render("adminSide/orderMangement", { order });
  });
});

//product lsit from order
router.get('/order-details/:id',async(req,res)=>{
  let productlist = await orderHelper.adminViewDetails(req.params.id)
  let orderlist = await orderHelper.adminorderlist()
 
  res.render('adminSide/orderDetails',{productlist,orderlist})
})
//order cancel in admins

router.get('/cancel-order/:id',(req,res)=>{

  orderHelper.cancelAdminOrder(req.params.id).then(()=>{
    res.redirect('/admin/order-management')
  })
})
//deliverd in adminsid
router.get('/delivered/:id',(req,res)=>{

  orderHelper.delivered(req.params.id).then(()=>{
    res.redirect('/admin/order-management')
  })
})
//banner mangement
router.get('/banner',(req,res)=>{
  adminHelper.viewBanner().then((banner) => {
  
  res.render('adminSide/bannerMangement',{banner})
  })
});
//add banners
router.get('/add-banners',(req,res)=>{
 res.render('adminSide/addBanners')
});


router.post('/add-banner',store.array('banner-image',2),(req,res)=>{
  const loc = req.files.map(filename);
    function filename(file) {
      return file.filename;
    }
    let bannerDetails = req.body;
    bannerDetails.imagefileName = loc;
  adminHelper.addBanner(bannerDetails).then((bannerDetails)=>{
    res.redirect("/admin/banner")
  })
})
//delete banners

router.get("/delete-banner/:id", (req, res) => {
  adminHelper.deleteBanner(req.params.id).then((deletelist) => {
    res.redirect("/admin/banner");
  });
});
//signout

router.get("/signout", (req, res) => {
  req.session.adminlogedIn = null;
  res.redirect("/admin");
});
//admin pannel graph
router.get("/graphData", async (req, res) => {
  var gdata = await adminHelper.getGraphData();
  var orderCounts = Array(12).fill(0)
  for (let date of gdata) {
    orderCounts[date._id.month -1] = date.count;
  } 
  res.json({data: orderCounts});
})

//admin pannel pie chart
router.get('/piechart',async(req,res)=>{
  let piechart = await adminHelper.getPieData();
  
  value = piechart.map((value,index,array)=>{
    return value.sum
  })
  let pay = piechart.map((value,index,array)=>{
    return value._id
  })

  res.json({value:value,pay:pay})
})
//sales report
router.get('/sales-report',(req,res)=>{
  res.render('adminSide/salesReport')
})
//daily report
router.post('/day-sales-report',async (req,res)=>{
  let date = req.body.day
  console.log(date);
  var products = await  adminHelper.viewProduct()
  for (let product of products) {
    let dayReport = await adminHelper.daySalesReport(product._id, date)
  }
  
  res.render('adminSide/daySalesReport')
})

//coupen section
router.get('/coupen',(req,res)=>{
  res.render('adminSide/coupen')
})
module.exports = router;
