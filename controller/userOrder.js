const orderHelper = require("../helpers/orderHelper");
const userCartHelper = require("../helpers/userCartHelper");
//pdf puppeter
const puppeteer = require("puppeteer")
let fsextra = require("fs-extra")
let hbs = require("handlebars")

module.exports = {
  order: (req, res) => {  
    if(req.session.existCoupon){
    userCartHelper.insertCouponId(req.session.user._id,req.session.existCoupon)
    }
    userCartHelper.orderRemoveCart(req.session.user._id).then((response) => {
      res.render("userSide/orderplaced");
    });
  },

  viewOrder: async (req, res) => {
    if (req.query.page) {
      var pageNum = req.query.page;
    } else {
      var pageNum = 1;
    }  
    const perPage = 10;
    let orderCount = await orderHelper.countOrder(req.session.user._id)
       let pages = Math.ceil(orderCount / perPage);
      //  let pagesArray = Array.from({ length: pages }, (_, i) => i + 1);
      let pagesArray = Array.from({ length: pages }, (_, i) =>  {
        return {page: i + 1, current: Number(pageNum)}
      })
    orderList = await orderHelper.viewOrderList(req.session.user._id, pageNum, perPage);
    let value = orderList.forEach((orderList, index) => {
      if (orderList.paymentStatus === "Delivered") {
        orderList.delivered = true;
      } else if (orderList.paymentStatus === "Requested Return") {
        orderList.return = true;
      } else if(orderList.paymentStatus == "Return Rejected" || orderList.paymentStatus == "Returned"){
        orderList.none = true
      }else if(orderList.couponAmt != "" ){
        orderList.coupon = true
      }
    })
    res.render("userSide/viewOrder", { orderList, user: req.session.user ,pagesArray,pageNum});
  },

  cancelOrder: (req, res) => {
    orderHelper.orderCancel(req.params.id, req.session.user._id,req.body.refundAmount,req.body.proId).then((response) => {
      res.redirect("/view-order");
    });
  },

  razorPayVerify: (req, res) => {
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
  },

  razorpayFailed :(req,res)=>{
    orderHelper.deletePendingOrder(req.session.user._id).then(()=>{     
      res.json({status:true})
    })
  },
  
  razorpayDismiss : (req,res)=>{
   orderHelper.deletePendingOrder(req.session.user._id).then((response)=>{
      res.json({status:true})
    })
  },

  paymentFailed :(req,res)=>{
    res.render('userSide/onlinePaymentFailed')
  },

  paypalVerify: (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    orderHelper
      .verifyPaypal(payerId, paymentId, req.session.paypalTotal)
      .then(() => {
        orderHelper.changePaymentStatus(req.session.orderId).then(() => {
          res.redirect("/orderplaced");
        });  
      });
  },

  cancelPaypal: (req,res) => {
    orderHelper.deletePendingOrder(req.session.user._id).then(()=>{
      res.redirect("/payment-failed");
    })
  },

  applyCoupon: async (req, res, next) => {
    try {
      let code = req.body.couponCode;
      let user = req.session.user._id;
      const date = new Date();
      let total = await userCartHelper.getTotalAmount(user);
      let applyCoupon = await orderHelper.applyCoupon(code, total, date,user);
      if (applyCoupon.couponVerified) {
        let discountAmount = (total * parseInt(applyCoupon.value)) / 100;
        let couponAmount = total - discountAmount;
        let upTo = parseInt(applyCoupon.upto)
        if(discountAmount<upTo){
          applyCoupon.subtotal = Math.round(discountAmount);
          applyCoupon.amount = Math.round(couponAmount);
        }
        else{
          applyCoupon.subtotal = upTo
          applyCoupon.amount = total - upTo
        }
        res.json(applyCoupon);
      } else {
        res.json(applyCoupon);
      }
    } catch (error) {
      next(error);
    }
  },

  //invoice
  invoice : async(req,res) =>{
    let invoice = await orderHelper.adminViewDetails(req.params.id);
    let pdfDocument = await orderHelper.adminViewDetails(req.params.id);
    let browser = await puppeteer.launch()
    let page = await browser.newPage()
    let html = await fsextra.readFile('./form.hbs', 'utf8')

    let content = hbs.compile(html)({ data: pdfDocument })

    await page.setContent(content)
    await page.pdf({
        path: 'output.pdf',
        format: 'A4',
        printBackground: true
    })
    await browser.close()

    res.render('userSide/invoice',{invoice})
  },

  pdfDownload : async(req,res) =>{
    res.download('output.pdf')
  }
};
