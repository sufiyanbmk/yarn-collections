const userhelpers = require("../helpers/userHelper");
const adminHelper = require("../helpers/adminHelper");
const userCartHelper = require("../helpers/userCartHelper");
const orderHelper = require("../helpers/orderHelper");

module.exports = {
  profile: async (req, res) => {
    let userDetail = await userhelpers.userProfile(req.session.user._id);
    let address = await orderHelper.getAddress(req.session.user._id);
    let orderhistory = await orderHelper.orderhistory(req.session.user._id);
    let couponCollection = await adminHelper.copuonView();
    let wallet = await userhelpers.getWallet(req.session.user._id);
    let value = orderhistory.forEach((orderhistory, index) => {
      if (orderhistory.status === "Delivered") {
        orderhistory.delivered = true;
      }
    });
    res.render("userSide/userAccount", {
      user: req.session.user,
      userDetail,
      address,
      orderhistory,
      couponCollection,
      wallet,
    });
    req.session.pswchangeError = false;
  },

  editProfile: (req, res) => {
    userhelpers.editProfile(req.session.user._id, req.body).then(() => {
      res.json({ status: true });
    });
  },

  changePassword: (req, res) => {
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
          res.json({ pswerr: req.session.pswchangeError });
        }
      });
  },

  profileAddress: (req, res) => {
    addressDetails = req.body;
    var uid = uuidv4();
    orderHelper
      .addAccountAddress(req.session.user._id, addressDetails, uid)
      .then(() => {
        res.redirect("/my-account");
      });
  },

  defaultAddress: (req, res) => {
    orderHelper.defaultAddress(req.params.id).then(() => {
      res.redirect("/my-account");
    });
  },

  replaceOrder: async (req, res) => {
    let replaceProduct = await orderHelper.replaceOrder(req.params.id);
    res.render("userSide/orderReplacement", {
      replaceProduct,
      user: req.session.user,
    });
  },

  replaceOrderPost: (req, res) => {
    res.json({ status: true });
  },
};
