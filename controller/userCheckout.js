const orderHelper = require("../helpers/orderHelper");
const userCartHelper = require("../helpers/userCartHelper");
const { v4: uuidv4 } = require("uuid");
const userHelper = require("../helpers/userHelper");

module.exports = {
  checkoutPage: async (req, res, next) => {
    try {
      let address = await orderHelper.getAddress(req.session.user._id);
      let total = await userCartHelper.getTotalAmount(req.session.user._id);
      let subTotal = req.body.subtotal;
      let couponAmt = req.body.finalAmount;
      let walletAmount = await orderHelper.walletAmount(req.session.user._id);
      let walletAmt = walletAmount.Total;
      res.render("userSide/checkout", {
        user: req.session.user._id,
        addressShow: address,
        total,
        subTotal,
        couponAmt,
        walletAmt,
      });
    } catch (error) {
      next(error);
    }
  },

  addressForm: (req, res) => {
    res.render("userSide/addressForm", { user: req.session.user._id });
  },

  addressFormPost: async (req, res, next) => {
    try {
      addressDetails = req.body;
      var uid = uuidv4();
      let addAddressorderSide = orderHelper.addAddress(
        req.session.user._id,
        addressDetails,
        uid
      );
      let address = await orderHelper.getAddress(req.session.user._id);
      let total = await userCartHelper.getTotalAmount(req.session.user._id);
      let subTotal = req.body.subtotal;
      let couponAmt = req.body.finalAmount;
      res.render("userSide/checkout", {
        user: req.session.user._id,
        addressShow: address,
        total,
        subTotal,
        couponAmt,
      });
    } catch (error) {
      next(error);
    }
  },

  deleteAddress: (req, res) => {
    orderHelper.deleteAddress(req.params.id).then(() => {
      res.redirect("/my-account");
    });
  },

  submitCheckout: async (req, res, next) => {
    try {
      let products = await orderHelper.getCartProductList(req.body.userId);
      let address = await orderHelper.getAddresByID(req.body.addressID);
      let totalPrice = await userCartHelper.getTotalAmount(
        req.session.user._id
      );
      orderHelper
        .placeOrder(req.body, products, address, totalPrice)
        .then(async (orderId) => {
          if (req.body["paymentMethod"] == "COD") {
            res.json({ codSuccess: true });
          } else if (req.body["paymentMethod"] == "Razorpay") {
            orderHelper
              .generateRazorpay(orderId, totalPrice)
              .then((response) => {
                response.unknown = true;
                res.json(response);
              });
          } else if (req.body["paymentMethod"] == "wallet") {
            let wallet = await userHelper.getWallet(req.session.user._id);
            if (wallet.Total >= totalPrice) {
              orderHelper
                .walletPurchase(req.session.user._id, totalPrice)
                .then(() => {
                  console.log("jidjfskdfjslkdfjsdlfjosdlf");
                  res.json({ walletSucces: true });
                });
            }
          } else {
            let items = await orderHelper.paypalItems(
              req.session.user._id,
              orderId
            );
            total = items.reduce(function (accumulator, items) {
              return accumulator + items.price * items.quantity;
            }, 0);
            req.session.paypalTotal = total;
            orderHelper.generatePaypal(items, total).then((payment) => {
              for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === "approval_url") {
                  res.json(payment.links[i]);
                }
              }
            });
          }
        });
    } catch (error) {
      next(error);
    }
  },
};
