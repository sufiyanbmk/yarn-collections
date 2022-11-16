const adminHelper = require("../helpers/adminHelper");
const userHelper = require("../helpers/userHelper");
module.exports = {
  home: async (req, res, next) => {
    let cartCount = null;
    let whislistCount = null;
    if (req.session.userLogin) {
      cartCount = await userHelper.getCartCount(req.session.user._id);
      whislistCount = await userHelper.getWhislistCount(req.session.user._id);
    }
    adminHelper.viewCategories().then(async (Category) => {
      let banner = await adminHelper.viewBanner();
      res.render("userSide/index", {
        user: req.session.user,
        Category,
        banner,
        cartCount,
        whislistCount,
      });
    });
  },

  backToHome: (req, res) => {
    res.redirect("/");
  },
};
