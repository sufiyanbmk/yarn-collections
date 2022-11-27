const whislistHelper = require("../helpers/whislistHelper");
const userHelper = require("../helpers/userHelper");
const adminHelper = require("../helpers/adminHelper");

module.exports = {
  whislist: async (req, res, next) => {
    try {
      let cartCount = null;
      let whislistCount = null;
      let bracket;
      if (req.session.userLogin) {
        cartCount = await userHelper.getCartCount(req.session.user._id);
        whislistCount = await userHelper.getWhislistCount(req.session.user._id);
         bracket = true
       }
       let Category =await adminHelper.getCatagory()

      let products = await whislistHelper.viewWhislist(req.session.user._id);
      res.render("userSide/whislist", { user: req.session.user, products ,  cartCount,
        whislistCount,
        bracket,
        Category      
      });
    } catch (error) {
      next(error);
    }
  },

  addToWhislist: (req, res) => {
    if (req.session.userLogin) {
    whislistHelper
      .addToWhislist(req.params.id, req.session.user._id)
      .then(() => {
        res.json({ status: true });
      });
    }else{
      res.json({status:false})
    }
  },

  deleteWhislist: (req, res) => {
    whislistHelper
      .deleteWhislistItem(req.session.user._id, req.params.id)
      .then(() => {
        res.json({ status: true });
      });
  },

  whislistNavCount: async(req,res) =>{
    let cartCount = null;
    if(req.session.user._id){
      cartCount = await userHelper.getCartCount(req.session.user._id);
      console.log(cartCount)
    }
  }
};
