const userhelpers = require("../helpers/userHelper");
const adminHelper = require("../helpers/adminHelper");
const userCartHelper = require("../helpers/userCartHelper");
const orderHelper = require("../helpers/orderHelper");
const { v4: uuidv4 } = require("uuid");
const userHelper = require("../helpers/userHelper");

module.exports = {
  profile: async (req, res, next) => {
    try {
      if (req.query.page) {
        var pageNum = req.query.page;
      } else {
        var pageNum = 1;
      }
      const perPage = 6;
      let orderCount = await orderHelper.orderCount(req.session.user._id);
      let pages = Math.ceil(orderCount / perPage);
      let pagesArray = Array.from({ length: pages }, (_, i) =>  {
        return {page: i + 1, current: Number(pageNum)}
      })
      let userDetail = await userhelpers.userProfile(req.session.user._id);
      let address = await orderHelper.getAddress(req.session.user._id);
      let orderhistory = await orderHelper.orderhistory(
        req.session.user._id,
        pageNum,
        perPage
      );
      let couponCollection = await adminHelper.copuonView();
      let wallet = await userhelpers.getWallet(req.session.user._id); 
      let Category =await adminHelper.getCatagory()
      // let value = orderhistory.forEach((orderhistory, index) => {
      //   if (orderhistory.status === "Delivered") {
      //     orderhistory.delivered = true;
      //   } else if (orderhistory.status === "order cancelled") {
      //     orderhistory.cancelled = true;
      //   }
      // });
      res.render("userSide/userAccount", {
        user: req.session.user,
        userDetail,
        address,
        orderhistory,
        couponCollection,
        wallet,
        pagesArray,
        pageNum,
        Category
      });
      req.session.pswchangeError = false;
    } catch (error) {
      next(error);
    }
  },

  viewProductDetail: async(req,res)=>{
    let productlist = await orderHelper.adminViewDetails(req.params.id);
    console.log(productlist)
  res.render("userSide/orderHistoryProduct", { productlist ,  user: req.session.user,});
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
        res.redirect("/my-account#address");
      });
  },

  defaultAddress: (req, res) => {
    orderHelper.defaultAddress(req.params.id).then(() => {
      res.redirect("/my-account");
    });
  },

  returnOrder: async (req, res) => {
    let returnProduct = await orderHelper.replaceOrder(req.params.id);
    console.log(returnProduct);
    res.render("userSide/orderReplacement", {
      returnProduct,
      user: req.session.user,
    });
  },

  returnOrderPost: (req, res) => {
    orderHelper
      .returnStatus(req.body.orderId, req.body.proId)
      .then((response) => {
        res.json(response);
      });
  },

  walletHistory:(req,res) => {
    userhelpers.userWalletHistory(req.params.id).then((history)=>{
      for(let i=0;i<history.History.length;i++){
        date=history.History[i].Time
        history.History[i].Time=date.getFullYear()+'-' + (date.getMonth()+1) + '-'+date.getDate();//prints expected format.
        if(history.History[i].Recieved){
          history.History[i].crdited = true;
        }
      }
      res.render('userSide/walletHistory',{history})
    })
  }
};
