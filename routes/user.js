var express = require("express");
var router = express.Router();
const userhelpers = require("../helpers/userHelper");
const userHelper = require("../helpers/userHelper");
const verifications = require("../controller/userVerification");
const products = require("../controller/userProducts");
const home = require("../controller/userHome");
const cart = require("../controller/userCart");
const whislist = require("../controller/userWhislist");
const checkout = require("../controller/userCheckout");
const userCheckout = require("../controller/userCheckout");
const order = require("../controller/userOrder");
const profile = require("../controller/userProfile");
const pdf = require('../controller/invoicepdf')

let userauth = function (req, res, next) {
  req.session.returnUrl = req.originalUrl
  if (req.session.userLogin) {
    next();
  } else {
    res.redirect("/login");
  }
};

let returnurl=function(req,res,next){
  req.session.returnUrl=req.originalUrl
  next()
}

/* GET home page. */

router.get("/", returnurl,home.home);

router.get("/home", returnurl,home.backToHome);

//-------------login for user--------------//

router.get("/login", verifications.loginGet);

router.post("/login", verifications.loginPost);

router.get("/signup", verifications.signupGet);

router.post("/signupForm", verifications.signupPost);

router.get("/otpLogin", verifications.mobilePage);

router.get("/otpValid", verifications.otpValidation);

router.post("/otpLogin", verifications.otpValidPost);

router.get("/otp", verifications.otpCodeChecking);

router.get("/resend", verifications.otpResend);

router.post("/otp-verified", verifications.otpPostVerification);

router.get("/logout", verifications.logout);

//-----------------products view-------------------//

router.get("/catagory-wise/:catagory", products.getCatagoryProducts)

router.get("/productview/:id", products.singleProduct);

//-----------------cart-------------------------//

router.get("/cart", userauth, cart.cart);

router.post("/add-to-cart/:id", cart.addToCart);

router.post("/changeQuantity", cart.changeQuantyCart);

router.delete("/delete/:id", cart.removeItemCart);

//-------------whislist------------//

router.get("/whislist", userauth, whislist.whislist);

router.post("/addWhislist/:id", whislist.addToWhislist);

router.delete("/whislistDelete/:id", whislist.deleteWhislist);

router.get('whislistviewCount', whislist.whislistNavCount)

//--------------proceed to checkout-----------//

router.get("/checkout", userauth,userCheckout.getCheckout)

router.post("/checkout", userauth, userCheckout.checkoutPage);

router.get("/addAddress", userauth, userCheckout.addressForm);

router.post("/address/:id", userauth, userCheckout.addressFormPost);

router.get("/edit-address:id",userCheckout.editAddress)

router.patch("/updat-address", userCheckout.updateAddressPost)

router.get("/delete-address/:id", userCheckout.deleteAddress);

router.post("/placeOrder", userCheckout.submitCheckout);

//--------------order-----------//

router.get("/orderplaced", order.order);

router.get("/view-order", userauth, order.viewOrder);

router.post("/order-cancel/:id", order.cancelOrder);

router.post("/verify-payment", order.razorPayVerify);

router.delete("/razorPayFailed" ,order.razorpayFailed)

router.delete('/razorpayDismisal' ,order.razorpayDismiss)

router.get('/payment-failed' ,order.paymentFailed)

router.get("/verify-paypal", order.paypalVerify);

router.get("/cancel-paypal",order.cancelPaypal)

router.post("/apply-coupon", order.applyCoupon);

router.get("/replace/:id/:proId", profile.returnOrder);

router.post("/replace-check", profile.returnOrderPost);

router.get("/invoice/:id/:proId", order.invoice);

router.get('/download-pdf', order.pdfDownload)

//---------------user profile account---------//

router.get("/my-account",userauth, profile.profile);

router.get("/order-viewdetails/:id", profile.viewProductDetail)

router.put("/edit-profile", profile.editProfile);

router.put("/change-password", profile.changePassword);

router.post("/account-address/:id", userauth, profile.profileAddress);

router.get("/default-address/:id", profile.defaultAddress);

router.get("/wallet-history/:id", profile.walletHistory)

module.exports = router;

