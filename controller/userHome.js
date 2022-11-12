module.exports = {
  home: (req, res, next) => {
    res.render("userSide/index", { user: req.session.user });
  },

  backToHome: (req, res) => {
    res.redirect("/");
  },
};
