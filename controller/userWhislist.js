const whislistHelper = require("../helpers/whislistHelper");

module.exports = {
  whislist: async (req, res) => {
    let products = await whislistHelper.viewWhislist(req.session.user._id);
    res.render("userSide/whislist", { user: req.session.user, products });
  },

  addToWhislist: (req, res) => {
    whislistHelper
      .addToWhislist(req.params.id, req.session.user._id)
      .then(() => {
        res.json({ status: true });
      });
  },

  deleteWhislist: (req, res) => {
    whislistHelper
      .deleteWhislistItem(req.session.user._id, req.params.id)
      .then(() => {
        res.json({ status: true });
      });
  },

};
