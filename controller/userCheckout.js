const orderHelper = require("../helpers/orderHelper");
const userCartHelper = require("../helpers/userCartHelper");
const { v4: uuidv4 } = require("uuid");

module.exports = {
  checkoutPage: async (req, res) => {
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
  },

  addressForm: (req, res) => {
    res.render("userSide/addressForm", { user: req.session.user._id });
  },

  addressFormPost: async (req, res) => {
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
  },

  deleteAddress: (req, res) => {
    orderHelper.deleteAddress(req.params.id).then(() => {
      res.redirect("/my-account");
    });
  },

  submitCheckout: async (req, res) => {
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
            response.unknown = true;
            res.json(response);
          });
        } else {
          orderHelper
            .generatePaypal(orderId, totalPrice, products)
            .then((payment) => {
              for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === "approval_url") {
                  res.json(payment.links[i]);
                }
              }
            });
        }
      });
  },
};
