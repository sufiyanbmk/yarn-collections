const adminHelper = require("../helpers/adminHelper");
module.exports = {
  home: (req, res, next) => {
    adminHelper.viewCategories().then((Category) => {
      res.render("userSide/index", { user: req.session.user ,Category});
    });
  
  },

  backToHome: (req, res) => {
    res.redirect("/");
  },
};
