const { response } = require("../app");
const adminHelper = require("../helpers/adminHelper");
const orderHelper = require("../helpers/orderHelper");
const store = require("../middleware/multer");
const Couponcodes = require('voucher-code-generator');
const adminDb = "admin";
const passwordDb = "123";

exports.home = async (req, res, next) => {
  if (req.session.adminlogedIn) {
    let profit = await adminHelper.revenue();
    let total = await adminHelper.totalOrder();
   
    res.render("adminSide/adminPannel",{profit,total});
  } else {
    res.render("adminSide/adminlogin", { error: req.session.validation });
    req.session.validation = false;
  }
};
exports.loginPost = (req, res, next) => {
  var admin = req.body.admin;
  var password = req.body.password;
  if (admin === adminDb && password === passwordDb) {
    req.session.adminlogedIn = true;
    res.redirect("/admin");
  } else {
    console.log("incoore");
    req.session.validation = "Invalid username or password";
    res.redirect("/admin");
  }
};

exports.signOut = (req, res) => {
  req.session.adminlogedIn = null;
  res.redirect("/admin");
};

//----------dash board -------------//

exports.dashboard =async (req, res) => {
  res.redirect("/admin/");
};

exports.graphData = async (req, res) => {
  var gdata = await adminHelper.getGraphData();
  var orderCounts = Array(12).fill(0);
  for (let date of gdata) {
    orderCounts[date._id.month - 1] = date.count;
  }
  res.json({ data: orderCounts });
};

exports.pieChartData = async (req, res) => {
  let piechart = await adminHelper.getPieData();

  value = piechart.map((value, index, array) => {
    return value.sum;
  });
  let pay = piechart.map((value, index, array) => {
    return value._id;
  });

  res.json({ value: value, pay: pay });
};

exports.paymentGraph = async (req,res) => {
  let paymentGraph = await adminHelper.paymenttotal();
  value = paymentGraph.map((value,index,array) => {
    return value.totalAmount;
  });
  let method = paymentGraph.map((value,index,array) => {
    return value._id
  })
  res.json({value:value, pay:method})
}

//-----------------catagory-------------//

exports.catagory = (req, res) => {
  adminHelper.viewCategories().then((Category) => {
    res.render("adminSide/categoryManagement", { Category });
  });
};

exports.addCatagory = (req, res) => {
  res.render("adminSide/addCategory");
};

exports.addCatagoryPost = (req, res) => {
  console.log(req.body)
  const loc = req.files.map(filename);
  function filename(file) {
    return file.filename;
  }
  let CatagoryDetails = req.body;
  CatagoryDetails.imagefileName = loc;
  adminHelper.addCategories(CatagoryDetails).then((Categorylist) => {
    res.redirect("/admin/categorymange");
  });
};

exports.backCatagory = (req, res) => {
  res.redirect("/admin/categorymange");
};

exports.editCatagory = async (req, res) => {
  let catagorydetail = await adminHelper.getCategoryDetails(req.params.id);
  res.render("adminSide/editCategory", { catagorydetail });
};

exports.editCatagoryPost = (req, res) => {
  adminHelper.updatedCategory(req.params.id, req.body).then((updatedlist) => {
    res.redirect("/admin/categorymange");
  });
};

exports.deleteCatagory = (req, res) => {
  adminHelper.deletecategory(req.params.id).then((deletelist) => {
    res.redirect("/admin/categorymange");
  });
};

//--------------products----------//

exports.products = (req, res) => {
  adminHelper.viewProduct().then((product) => {
    res.render("adminSide/productManagement", { product });
  });
};

exports.addProducts = (req, res) => {
  adminHelper.viewCategories().then((Categorylist) => {
    res.render("adminside/addProduct", { Categorylist });
  });
};

exports.backToProducts = (req, res) => {
  res.redirect("/admin/productmange");
};

exports.addProductsPost = (req, res, next) => {
  const loc = req.files.map((file) => file.filename);
  // function filename(file) {
  //   return file.filename;
  // }
  let productDetails = req.body;
  productDetails.imagefileName = loc;
  adminHelper.addProduct(productDetails).then((productDetails) => {
    res.redirect("/admin/productmange");
  });
};

exports.editProducts = async (req, res) => {
  await adminHelper.getProduct(req.params.id).then((product) => {
    adminHelper.viewCategories().then((Categorylist) => {
      res.render("adminSide/editProduct", { product, Categorylist });
    });
  });
};

exports.editProductsPost = (req, res) => {
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
};

exports.deleteProducts = (req, res) => {
  adminHelper.deleteProduct(req.params.id).then((response) => {
    res.redirect("/admin/productmange");
  });
};

//-------------customer-----------//

exports.customer = (req, res) => {
  adminHelper.viewUser().then((users) => {
    res.render("adminSide/userMangement", {
      users,
      activated: req.session.active,
    });
  });
};

exports.blockCustomer = (req, res) => {
  adminHelper.banUser(req.params.id).then((response) => {
    if (response) {
      res.redirect("/admin/usermange");
    }
  });
};

exports.unBlockCustomer = (req, res) => {
  adminHelper.unbanUser(req.params.id).then((response) => {
    if (response) {
      res.redirect("/admin/usermange");
    }
  });
};

//-----------orders --------//

exports.orders = (req, res) => {
  orderHelper.adminorderlist().then((order) => {
    let value = order.forEach((order, index) => {
      if (order.status === "order cancelled") {
        order.cancelled = true;
      }
    });
    res.render("adminSide/orderMangement", { order });
  });
};

exports.orderDetailsView = async (req, res) => {
  let productlist = await orderHelper.adminViewDetails(req.params.id);
  productlist.forEach(e =>{
    if(e.status == 'Requested Return'){
      e.return = true
    }
    else if(e.status == 'Delivered'|| e.status == 'Order Cancelled'|| e.status == 'Returned'){
      e.displayNone = true
    }
  })
  res.render("adminSide/orderDetails", { productlist});
};

exports.cancelOrder = (req, res) => {
  orderHelper.cancelAdminOrder(req.params.id).then(() => {
    res.redirect("/admin/order-management");
  });
};

exports.deliveredStatus = (req, res) => {
  orderHelper.delivered(req.params.id).then(() => {
    res.redirect("/admin/order-management");
  });
};

exports.shippedStatus = (req,res) => {
  orderHelper.shipped(req.params.id).then(() => {});
  res.redirect("/admin/order-management");
};

exports.orderStatus = (req,res) => {
  orderHelper.changeStatus(req.body).then(()=>{
    res.json({status:true})
  })
}

exports.refund =async (req, res) => {
  const orderDetail =await orderHelper.orderIduserId(req.query.orderID,req.query.proId)
  const orderId = orderDetail._id
  const proId = orderDetail.products[0].product
  const amount = orderDetail.products[0].price;
  const userId = orderDetail.userId
  const paymentMethod  = orderDetail.paymentMethod

  if(paymentMethod != 'COD'){
    orderHelper.refund(amount,userId).then(async (response)=>{
      await orderHelper.returnStatusChange(orderId,proId)
      res.json(response)
    })
  }
  else{
    res.json({status:false})
  }
};

//------------------banner mangement ----------//

exports.banners = (req, res) => {
  adminHelper.viewBanner().then((banner) => {
    res.render("adminSide/bannerMangement", { banner });
  });
};

exports.addBanners = (req, res) => {
  res.render("adminSide/addBanners");
};

exports.addBannersPost = (req, res) => {
  const loc = req.files.map(filename);
  function filename(file) {
    return file.filename;
  }
  let bannerDetails = req.body;
  bannerDetails.imagefileName = loc;
  adminHelper.addBanner(bannerDetails).then((bannerDetails) => {
    res.redirect("/admin/banner");
  });
};

exports.deleteBanner = (req, res) => {
  adminHelper.deleteBanner(req.params.id).then((deletelist) => {
    res.redirect("/admin/banner");
  });
};

//-------------sales report--------------//

exports.salesReport = (req, res) => {
  res.render("adminSide/salesReport");
};

exports.dailyReport = async (req, res) => {
  let date = req.body.day;
  var products = await adminHelper.viewProduct();
  let td = [];
  for (let product of products) {
    let [dayReport] = await adminHelper.daySalesReport(product._id, date);
    if (dayReport) {
      dayReport.totalPrice = Number(dayReport._id.price) * dayReport.qtysum;
      td.push(dayReport);
    }
  }
  res.render("adminSide/daySalesReport", { td });
};

exports.monthlyReport = async (req, res) => {
  let date = req.body.month;
  let month = [];
  let products = await adminHelper.viewProduct();
  for (let product of products) {
    let [monthReport] = await adminHelper.monthSalesReport(product._id, date);
    if (monthReport) {
      monthReport.totalPrice =
        Number(monthReport._id.price) * monthReport.qtysum;
      month.push(monthReport);
    }
  }
  res.render("adminSide/monthlySalesReport", { month });
};

exports.yearlyReport = async (req, res) => {
  let date = req.body.year;
  let year = [];
  let products = await adminHelper.viewProduct();
  for (let product of products) {
    let [yearReport] = await adminHelper.yearSalesReport(product._id, date);
    if (yearReport) {
      yearReport.totalPrice = Number(yearReport._id.price) * yearReport.qtysum;
      year.push(yearReport);
    }
  }
  res.render("adminSide/yearlySalesReport", { year });
};

//-----------coupon section --------------//

exports.coupon = async (req, res) => {
  let couponCollection = await adminHelper.copuonView();
  res.render("adminSide/coupen", { couponCollection });
};

exports.addCoupon = (req, res) => {
  res.render("adminSide/addCoupon");
};

exports.addCouponPost = (req, res) => {
  adminHelper.addCoupon(req.body).then((response) => {
    res.redirect("/admin/coupon");
  });
};

exports.editCoupon = async (req, res) => {
  let couponId = req.params.id;
  let singleCoupon = await adminHelper.editCoupon(couponId);
  res.render("adminSide/editCoupon", { singleCoupon });
};

exports.editCouponPost = (req, res) => {
  let couponId = req.params.id;
  adminHelper.updateCoupon(req.body, couponId).then(() => {
    res.redirect("/admin/coupon");
  });
};

exports.deleteCoupon = (req, res) => {
  let couponId = req.params.id;
  adminHelper.deleteCoupon(couponId).then(() => {
    res.redirect("/admin/coupon");
  });
};

//-----------catagory offer---------------//

exports.catagoryOffer = async (req, res) => {
  let catagoryList = await adminHelper.viewCategories();
  res.render("adminSide/catagoryOffer", { catagoryList });
};

exports.catagoryOfferPost = (req, res) => {
  let { catagory, offer } = req.body;
  offerPercentage = parseInt(offer);
  adminHelper.catagoryOffer(catagory, offerPercentage).then((response) => {});
  res.redirect("/admin/catagory-offer");
};

//------------product offer-----------//

exports.productOffer = (req, res) => {
  let productId = req.params.id;
  res.render("adminSide/ProductOffer", { productId });
};

exports.productOfferPost = (req, res) => {
  let offer = req.body.offer;
  let proId = req.body.proId;
  console.log(offer);
  offer = parseInt(offer);
  adminHelper.productOffer(offer, proId).then((response) => {});
  res.redirect("/admin/productmange");
};
