const adminHelper = require("../helpers/adminHelper");
const userHelper = require("../helpers/userHelper");
const whislistHelper = require("../helpers/whislistHelper");
module.exports = {
  home: async (req, res, next) => {
    let cartCount = null;
    let whislistCount = null;
    let bracket;
    let topProduct = await userHelper.topProducts()
    if (req.session.userLogin) {
      cartCount = await userHelper.getCartCount(req.session.user._id);
      whislistCount = await userHelper.getWhislistCount(req.session.user._id);
       bracket = true
       let whislist = await whislistHelper.getuserWhislist(req.session.user._id);
       topProduct.forEach((element)=>{
        // whislist.forEach((item)=>{
        //   if(element.products._id.equals(item.product._id)){
        //     element.whislist =true;
        //   }
        // })
       })
    }
    adminHelper.getCatagory().then(async (Category) => {
      let banner = await userHelper.getBanner();
      res.render("userSide/index", {
        user: req.session.user,
        Category,
        banner,
        cartCount,
        whislistCount,
        bracket,
        topProduct
      });
    });
  },

  backToHome: (req, res) => {
    res.redirect("/");
  },
};
