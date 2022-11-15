const { compareSync } = require("bcrypt");
var express = require("express");
const {
  RecordingRulesInstance,
} = require("twilio/lib/rest/video/v1/room/roomRecordingRule");
const { response, off } = require("../app");
const { Category } = require("../config/collection");
const adminHelper = require("../helpers/adminHelper");
const orderHelper = require("../helpers/orderHelper");
const store = require("../middleware/multer");
const { route } = require("./user");
var router = express.Router();
const controller = require("../controller/adminController");
const auth = function (req, res, next) {
  if (req.session.adminlogedIn) {
    next();
  } else {
    res.redirect("/admin");
  }
};

router.get("/", controller.home);

router.post("/adminLogin", controller.loginPost);

router.get("/signout", controller.signOut);

router.get("/dashboard", controller.dashboard);

router.get("/graphData", controller.graphData);

router.get("/piechart", controller.pieChartData);

router.get("/payment-graph", controller.paymentGraph)
//category

router.get("/categorymange", controller.catagory);

router.get("/addCategory", controller.addCatagory);

router.post("/addCategory", store.array("catagoryimage", 2), controller.addCatagoryPost);

router.get("/backCategory", controller.backCatagory);

router.get("/edit/:id", controller.editCatagory);

router.post("/updateCategory/:id", controller.editCatagoryPost);

router.get("/delete/:id", controller.deleteCatagory);

//products

router.get("/productmange", controller.products);

router.get("/addProduct", controller.addProducts);

router.get("/backProduct", controller.backToProducts);

router.post("/addProduct", store.array("image", 4), controller.addProductsPost);

router.get("/editProducts/:id", controller.editProducts);

router.post(
  "/editProduct/:id",
  store.array("image", 3),
  controller.editProductsPost
);

router.get("/deleteProducts/:id", controller.deleteProducts);

//customer

router.get("/usermange", controller.customer);

router.get("/banned/:id", controller.blockCustomer);

router.get("/unbanned/:id", controller.unBlockCustomer);

//order mangament

router.get("/order-management", controller.orders);

router.get("/order-details/:id", controller.orderDetailsView);

router.get("/cancel-order/:id", controller.cancelOrder);

router.get("/delivered/:id", controller.deliveredStatus);

router.get("/shipped/:id", controller.shippedStatus)

router.post("/orderStatus", controller.orderStatus)

router.get("/refund", controller.refund)

//banner mangement

router.get("/banner", controller.banners);

router.get("/add-banners", controller.addBanners);

router.post(
  "/add-banner",
  store.array("banner-image", 2),
  controller.addBannersPost
);

router.get("/delete-banner/:id", controller.deleteBanner);

//sales report

router.get("/sales-report", controller.salesReport);

router.post("/day-sales-report", controller.dailyReport);

router.post("/monthly-sale", controller.monthlyReport);

router.post("/year-sale", controller.yearlyReport);

//coupen section

router.get("/coupon", controller.coupon);

router.get("/add-coupon", controller.addCoupon);

router.post("/post-coupon", controller.addCouponPost);

router.get("/edit-coupon/:id", controller.editCoupon);

router.post("/update-coupon/:id", controller.editCouponPost);

router.get("/delete-coupon/:id", controller.deleteCoupon);

//catagory offer

router.get("/catagory-offer", controller.catagoryOffer);

router.post("/catagroy-offer", controller.catagoryOffer);

//product offer

router.get("/product-offer/:id", controller.productOffer)

router.post("/product-offer", controller.productOfferPost)

module.exports = router;
