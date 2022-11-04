var express = require("express");
const { resource, response } = require("../app");
var router = express.Router();
const config = require("../config/twolio");
const client = require("twilio")(config.accountSID, config.authToken);
const userhelpers = require("../helpers/userHelper");
const adminHelper = require("../helpers/adminHelper");
const userCartHelper = require("../helpers/userCartHelper");
const whislistHelper = require("../helpers/whislistHelper");
const orderHelper = require("../helpers/orderHelper");
const { route } = require("./admin");

const { v4: uuidv4 } = require("uuid");

let userauth = function (req, res, next) {
  if (req.session.userLogin) {
    next();
  } else {
    res.redirect("/login");
  }
};

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("userSide/index", { user: req.session.user });
});
//login for user
router.get("/login", (req, res) => {
  if (req.session.userLogin) {
    req.session.active = true;
    res.redirect("/");
  } else {
    res.render("userSide/login", { error: req.session.error });
    req.session.error = false;
  }
});

router.post("/login", (req, res) => {
  userhelpers.dologin(req.body).then((response) => {
    if (response.status) {
      req.session.userLogin = true;
      req.session.user = response.user;
      res.redirect("/");
    } else if (response.ban) {
      req.session.error = "Sorry ! You cant access ";
      res.redirect("/login");
    } else {
      req.session.error = "Oops! wrong Password or Email";
      res.redirect("/login");
    }
  });
});
//signup for user
router.get("/signup", (req, res) => {
  res.render("userSide/signup", { error: req.session.usedEmail });
  req.session.usedEmail = false;
});

router.post("/signupForm", (req, res) => {
  userhelpers.dosignup(req.body).then((response) => {
    if (response.email) {
      req.session.usedEmail = "Acount is already exist";
      res.redirect("/signup");
    } else {
      res.redirect("/login");
    }
  });
});

router.get("/otpLogin", (req, res) => {
  res.render("userSide/mobile", { error: req.session.invalidNumber,});
  req.session.invalidNumber = false;
});
router.get("/otpValid", (req, res) => {
  res.render("userSide/otpValidation");
});

router.post("/otpLogin", (req, res) => {
  userhelpers.otp(req.body.mobilenumber).then((response) => {
    if (response) {
      client.verify
        .services(config.serviceID)
        .verifications.create({
          to: `+91${req.body.mobilenumber}`,
          channel: "sms",
        })
        .then((data) => {
          req.session.mobilenumber = data.to;
          res.redirect("/otpValid");
        });
    } else {
      req.session.invalidNumber = "Number is not Registered";
      res.redirect("/otpLogin");
    }
  });
});

router.get("/otp", (req, res) => {
  res.render("userSide/otpValidation", {
    phone: req.session.phone,
    otp: req.session.otpfail,
  });
  req.session.otpfail = false;
});

router.get("/resend", (req, res) => {
  client.verify
    .services(config.serviceID)
    .verifications.create({
      to: req.session.mobilenumber,
      channel: "sms",
    })
    .then((data) => {
      console.log("sucess");
    });
});

router.post("/otp-verified", (req, res) => {
  var arr = Object.values(req.body);
  var otp = arr.toString().replaceAll(",", "");

  client.verify
    .services(config.serviceID)
    .verificationChecks.create({
      to: req.session.mobilenumber,
      code: otp,
    })
    .then((data) => {
      if (data.valid) {
        req.session.userLogin = true;
        res.redirect("/");
      } else {
        req.session.otpfail = "wrong";
        res.redirect("/otp");
      }
    });
});
// logout
router.get("/logout", (req, res) => {
  req.session.userLogin = null;
  req.session.user = null;
  req.session.active = false;
  res.redirect("/");
});

//products view

router.get("/home", (req, res) => {
  res.redirect("/");
});

router.get("/womenProducts", (req, res) => {
  adminHelper.viewProduct().then((product) => {
    res.render("userSide/shop", { product, user: req.session.user });
  });
});
//single product
router.get("/productview/:id", (req, res) => {
  adminHelper.findProductDetails(req.params.id).then((data) => {
    res.render("userSide/singleProduct", { data, user: req.session.user });
  });
});

// cart
router.get("/cart", userauth, async (req, res, next) => {
  let product = await userCartHelper.getCartProducts(req.session.user._id);
  console.log(product);
  if (product.length == 0) {
    product.empty = true;
  }
  else{

    var total = await userCartHelper.getTotalAmount(req.session.user._id)
  }

  res.render("userSide/cart", {product,user: req.session.user,total});
});
//add to cart
router.post("/add-to-cart/:id",(req, res) => {
  if(req.session.userLogin){
  userCartHelper.addCart(req.params.id, req.session.user._id).then(() => {
    res.json({status:true})
  
  });
}
else{
  res.json({status:false})
}
});

// qunatity
router.post("/changeQuantity", (req, res) => {
  userCartHelper.changeQuantity(req.body).then(async (response) => {
    // response.total = await userCartHelper.getTotalAmount(req.session.user._id);
    res.json(response);
  });
});

//delete cart
router.delete("/delete/:id", (req, res) => {

  userCartHelper
    .deleteCartItem(req.session.user._id, req.params.id)
    .then(() => {
      res.json({});
    });
});

// whislist
router.route("/whislist").get(userauth, async (req, res) => {
  let products = await whislistHelper.viewWhislist(req.session.user._id);
  res.render("userSide/whislist", { user: req.session.user, products });
});

router.post("/addWhislist/:id", userauth, (req, res) => {
  whislistHelper.addToWhislist(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true });
  });
});

//delete whislist
router.delete("/whislistDelete/:id", (req, res) => {
  whislistHelper
    .deleteWhislistItem(req.session.user._id, req.params.id)
    .then(() => {
      res.json({ status: true });
    });
});

//proceed to checkout
router.get("/checkout", userauth, async (req, res) => {
  let address = await orderHelper.getAddress(req.session.user._id);
  let total = await userCartHelper.getTotalAmount(req.session.user._id);

  res.render("userSide/checkout", {
    user: req.session.user._id,
    addressShow: address,
    total,
  });
});

//add new address form
router.get("/addAddress", userauth, (req, res) => {
  res.render("userSide/addressForm", { user: req.session.user._id });
});
//submiting address
router.post("/address/:id", userauth, (req, res) => {
  addressDetails = req.body;
  var uid = uuidv4();
  orderHelper.addAddress(req.session.user._id, addressDetails, uid).then(() => {
    res.redirect("/checkout");
  });
});
//addrss delete

router.get('/delete-address/:id',(req,res)=>{
  orderHelper.deleteAddress(req.params.id).then(()=>{
    res.redirect('/my-account')
  })
})
//checkout submit
router.post("/placeOrder", async (req, res) => {
  let products = await orderHelper.getCartProductList(req.body.userId);
  let address = await orderHelper.getAddresByID(req.body.addressID);
  let totalPrice = await userCartHelper.getTotalAmount(req.session.user._id);

  orderHelper
    .placeOrder(req.body, products, address, totalPrice)
    .then((orderId) => {
      if (req.body["paymentMethod"] == "COD") {
        res.json({ codSuccess: true });
      } else if (req.body["paymentMethod"] == "Razorpay") {
      
        orderHelper.generateRazorpay(orderId, totalPrice).then((response) => {
          response.unknown = true
          res.json(response);
        });
      } else {
        orderHelper.generatePaypal(orderId, totalPrice,products).then((payment) => {
          for(let i=0;i<payment.links.length;i++){
            if(payment.links[i].rel === 'approval_url'){
              res.json(payment.links[i])
            }
          }
        });
      }
    });
});
//order placed
router.get("/orderplaced", (req, res) => {
  res.render("userSide/orderplaced");
});
//view order
router.get("/view-order", userauth, async (req, res) => {
  orderList = await orderHelper.viewOrderList(req.session.user._id);
 
  res.render("userSide/viewOrder", { orderList, user: req.session.user });
});


// canceling order
router.get("/order-cancel/:id", (req, res) => {
  orderHelper.orderCancel(req.params.id).then(() => {
    res.redirect("/view-order");
  });
});

//razorpay verify
router.post("/verify-payment", (req, res) => {
  orderHelper
    .verifyPayment(req.body)
    .then(() => {
      orderHelper.changePaymentStatus(req.body["order[receipt]"]).then(() => {
        res.json({ status: true });
      });
    })
    .catch((err) => {
      res.json({ status: false, errMsg: "payment failed" });
    });
});

//payppal verify
router.get('/verify-paypal',(req,res)=>{
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  orderHelper.verifyPaypal(payerId,paymentId).then(()=>{
    res.redirect('/orderplaced')
  })
})

//user profile account
router.get("/my-account", async (req, res) => {
  let userDetail = await userhelpers.userProfile(req.session.user._id);
  let address = await orderHelper.getAddress(req.session.user._id);
  let orderhistory = await orderHelper.orderhistory(req.session.user._id)
  console.log(orderhistory)
  res.render("userSide/userAccount", {
    user: req.session.user,
    userDetail,
    address,
    orderhistory
  });
  req.session.pswchangeError = false
});

//edit profile
router.put("/edit-profile", (req, res) => {
  userhelpers.editProfile(req.session.user._id, req.body).then(() => {
  res.json({status:true});
  });
});
//profile image
// router.post('/profile-img',store.array('banner-image',2),(req,res)=>{
//   const loc = req.files.map(filename);
//     function filename(file) {
//       return file.filename;
//     }
//     let profileImg = req.body;
//     profileImg.imagefileName = loc;
// })

//password change
router.put("/change-password", (req, res) => {
  console.log(req.body);
  userhelpers
    .passwordChange(req.session.user._id, req.body)
    .then((response) => {
      console.log(response);
      if (response.modifiedCount == 1) {
        res.json(response);
      } else {
        console.log("wrong password");
        req.session.pswchangeError = "Wrong password ";
        res.json({pswerr : req.session.pswchangeError})
    
      }
    });
});
//account address
router.post("/account-address/:id", userauth, (req, res) => {
  addressDetails = req.body;
  var uid = uuidv4();
  orderHelper.addAccountAddress(req.session.user._id, addressDetails, uid).then(() => {
    res.redirect("/my-account");
  });
});

//default Address
router.get('/default-address/:id',(req,res)=>{
  
  orderHelper.defaultAddress(req.params.id).then(()=>{
    res.redirect('/my-account')
  })
})
module.exports = router;
