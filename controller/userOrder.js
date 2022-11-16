const orderHelper = require("../helpers/orderHelper");
const userCartHelper = require("../helpers/userCartHelper");

module.exports = {
  order: (req, res) => {
    userCartHelper.orderRemoveCart(req.session.user._id).then((response) => {
      res.render("userSide/orderplaced");
    });
  },

  viewOrder: async (req, res) => {
    orderList = await orderHelper.viewOrderList(req.session.user._id);
    res.render("userSide/viewOrder", { orderList, user: req.session.user });
  },

  cancelOrder: (req, res) => {
    orderHelper.orderCancel(req.params.id, req.session.user._id).then(() => {
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

  paypalVerify: (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    orderHelper
      .verifyPaypal(payerId, paymentId, req.session.paypalTotal)
      .then(() => {
        res.redirect("/orderplaced");
      });
  },

  cancelPaypal: () => {
    res.redirect("/cart");
  },

  applyCoupon: async (req, res, next) => {
    try {
      let code = req.body.couponCode;
      let user = req.session.user._id;
      const date = new Date();
      let total = await userCartHelper.getTotalAmount(user);
      let applyCoupon = await orderHelper.applyCoupon(code, total, date);
      if (applyCoupon.couponVerified) {
        let discountAmount = (total * parseInt(applyCoupon.value)) / 100;
        let couponAmount = total - discountAmount;
        applyCoupon.subtotal = Math.round(discountAmount);
        applyCoupon.amount = Math.round(couponAmount);
        res.json(applyCoupon);
      } else {
        res.json(applyCoupon);
      }
    } catch (error) {
      next(error);
    }
  },
};
