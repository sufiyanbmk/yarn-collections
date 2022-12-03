const { response } = require("../app");
const adminHelper = require("../helpers/adminHelper");
const orderHelper = require("../helpers/orderHelper");
const store = require("../middleware/multer");
const Couponcodes = require("voucher-code-generator");

require('dotenv').config()
// admin login credentials
const adminDetail = {
    name: process.env.adminDb,
    password: process.env.passwordDb,
  };

exports.home = async (req, res, next) => {
  if (req.session.adminlogedIn) {
    let profit = await adminHelper.revenue();
    let total = await adminHelper.totalOrder();

    res.render("adminSide/adminPannel", { profit, total });
  } else {
    res.render("adminSide/adminlogin", { error: req.session.validation });
    req.session.validation = false;
  }
};
exports.loginPost = (req, res, next) => {
  var admin = req.body.admin;
  var password = req.body.password;
  if (admin === adminDetail.name && password === adminDetail.password) {
    req.session.adminlogedIn = true;
    res.redirect("/admin");
  } else {
    req.session.validation = "Invalid username or password";
    res.redirect("/admin");
  }
};

exports.signOut = (req, res) => {
  req.session.adminlogedIn = null;
  res.redirect("/admin");
};

//----------dash board -------------//

exports.dashboard = async (req, res) => {
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

exports.paymentGraph = async (req, res) => {
  let paymentGraph = await adminHelper.paymenttotal();
  value = paymentGraph.map((value, index, array) => {
    return value.totalAmount;
  });
  let method = paymentGraph.map((value, index, array) => {
    return value._id;
  });
  res.json({ value: value, pay: method });
};


//-----------------catagory-------------//

exports.catagory =async (req, res) => {
  const pageNum = req.query.page;
  const perPage = 3;
  const countCatagory =await adminHelper.getCatagoryCount()
  let pages = Math.ceil(countCatagory / perPage);
  let pagesArray = Array.from({ length: pages }, (_, i) => i + 1);
  adminHelper.viewCategories(pageNum,perPage).then((Category) => {
    res.render("adminSide/categoryManagement", { Category ,pagesArray });
  });
};

exports.addCatagory = (req, res) => {
  res.render("adminSide/addCategory", {
    invalidCatagory: req.session.invalidCatagory,
  });
  req.session.invalidCatagory = false;
};

exports.addCatagoryPost = (req, res) => {
  const loc = req.files.map(filename);
  function filename(file) {
    return file.filename;
  }
  let CatagoryDetails = req.body;
   CatagoryDetails.categories = CatagoryDetails.categories.toUpperCase();
  CatagoryDetails.imagefileName = loc;
  adminHelper.addCategories(CatagoryDetails).then((response) => {
    if (response.catagoryExist) {
      req.session.invalidCatagory = "This Catagory name is already exist";
      res.redirect("/admin/addCategory");
    } else {
      res.redirect("/admin/categorymange");
    }
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
  let CatagoryDetails = req.body;
  CatagoryDetails.categories = CatagoryDetails.categories.toUpperCase();
  adminHelper.updatedCategory(req.params.id, CatagoryDetails).then((updatedlist) => {
    res.redirect("/admin/categorymange");
  });
};

exports.deleteCatagory = (req, res) => {
  adminHelper.deletecategory(req.params.id).then((deletelist) => {
    res.redirect("/admin/categorymange");
  });
};
//-----------sub catagory---------//

exports.subCatagory = async (req,res) => {
  let catagory = await adminHelper.getCatagory()
  res.render("adminSide/subCatagory",{catagory})
}

exports.postSubCatagory = (req,res) => {
  adminHelper.addSubCatagory(req.body).then(()=>{
    res.json({status:true})
  })
}

exports.deleteSubCatagory = (req,res) => {
  adminHelper.deleteSubCatagory(req.body).then(()=>{
    res.json({status:true})
  })
},
//--------------products----------//

exports.products =async (req, res) => {
  const pageNum = req.query.page;
  const perPage = 5;
  const proCount = await adminHelper.productsCount()
  let pages = Math.ceil(proCount / perPage);
  let pagesArray = Array.from({ length: pages }, (_, i) =>  {
    return {page: i + 1, current: Number(pageNum)}
  });
  adminHelper.viewProduct(pageNum, perPage).then((product) => {
    res.render("adminSide/productManagement", { product, pagesArray, pageNum});
  });
};

exports.addProducts = (req, res) => {
  adminHelper.getCatagory().then((Categorylist) => {
    res.render("adminside/addProduct", { Categorylist });
  });
};

exports.catagorySelectionOption =async (req,res) => {
  subCatagory = await adminHelper.catagorySelection(req.body.catagoryName)
  res.json(subCatagory)
}

exports.backToProducts = (req, res) => {
  res.redirect("/admin/productmange");
};

exports.addProductsPost = (req, res, next) => {
  const loc = req.files.map((file) => file.filename);
  let productDetails = req.body;
  productDetails.imagefileName = loc;
  adminHelper.addProduct(productDetails).then((productDetails) => {
    res.redirect("/admin/productmange");
  });
};

exports.editProducts = async (req, res) => {
  await adminHelper.getProduct(req.params.id).then((product) => {
    adminHelper.getCatagory().then((Categorylist) => {
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
  productDetails.stock = parseInt(productDetails.stock)
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

exports.customer = async (req, res) => {
  const pageNum = req.query.page;
  const perPage = 10;
  const userCount = await adminHelper.getCountUser()
  let pages = Math.ceil(userCount / perPage);
  let pagesArray = Array.from({ length: pages }, (_, i) => i + 1);
  adminHelper.viewUser(pageNum,perPage).then((users) => {
    res.render("adminSide/userMangement", {
      users,
      pagesArray
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

exports.orders = async (req, res) => {
  const pageNum = req.query.page;
  const perPage = 10;
  const orderCount =await orderHelper.adminOrderCount()
  let pages = Math.ceil(orderCount / perPage);
  let pagesArray = Array.from({ length: pages }, (_, i) =>  {
    return {page: i + 1, current: Number(pageNum)}
  });
  orderHelper.adminorderlist(pageNum,perPage).then((order) => {
    let value = order.forEach((order, index) => {
      if (order.status === "pending") {
        order.pending = true;
      }
    });
    res.render("adminSide/orderMangement", { order ,pagesArray,pageNum});
  });
};

exports.orderDetailsView = async (req, res) => {
  let productlist = await orderHelper.adminViewDetails(req.params.id);
  console.log(productlist)
  productlist.forEach((e) => {
    if (e.status == "Requested Return") {
      e.return = true;
    } else if (e.status == "Delivered"|| e.status=="Order Cancelled" || e.status == "Returned" || e.status=="Return Rejected") {
      e.displayNone = true;
    }
  });

  res.render("adminSide/orderDetails", { productlist });
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

exports.shippedStatus = (req, res) => {
  orderHelper.shipped(req.params.id).then(() => {});
  res.redirect("/admin/order-management");
};

exports.orderStatus = (req, res) => {
  orderHelper.changeStatus(req.body).then(() => {
    res.json({ status: true });
  });
};

exports.refund = async (req, res) => {
  const orderDetail = await orderHelper.orderIduserId(
    req.query.orderID,
    req.query.proId
  );
  const orderId = orderDetail._id;
  const proId = orderDetail.products[0].product;
  const amount = orderDetail.products[0].price;
  const userId = orderDetail.userId;
  const paymentMethod = orderDetail.paymentMethod;

  if (paymentMethod != "COD") {
    orderHelper.refund(amount, userId).then(async (response) => {
      await orderHelper.returnStatusChange(orderId, proId);
      res.json(response);
    });
  } else {
    res.json({ status: false });
  }
};

//------------------banner mangement ----------//

exports.banners = async (req, res) => {
  const pageNum = req.query.page;
  const perPage = 3;
  const bannerCount =await adminHelper.bannerCount()
  let pages = Math.ceil(bannerCount / perPage);
  let pagesArray = Array.from({ length: pages }, (_, i) => i + 1);
  adminHelper.viewBanner(pageNum,perPage).then((banner) => {
    res.render("adminSide/bannerMangement", { banner,pagesArray });
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
  let products = await adminHelper.getproductsForReport();
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
  let products = await adminHelper.getproductsForReport();
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
  let products = await adminHelper.getproductsForReport();
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
  let catagoryList = await adminHelper.getCatagory();
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
  offer = parseInt(offer);
  adminHelper.productOffer(offer, proId).then((response) => {});
  res.redirect("/admin/productmange");
};
