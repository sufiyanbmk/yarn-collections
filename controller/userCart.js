const userCartHelper = require("../helpers/userCartHelper");
const userHelper = require("../helpers/userHelper");
const adminHelper = require("../helpers/adminHelper");

module.exports = {
  cart: async (req, res, next) => {
    let cartCount = null;
    let whislistCount = null;
    let bracket;
    if (req.session.userLogin) {
      cartCount = await userHelper.getCartCount(req.session.user._id);
      whislistCount = await userHelper.getWhislistCount(req.session.user._id);
       bracket = true
     }
    let product = await userCartHelper.getCartProducts(req.session.user._id);
    if (product.length == 0) {
      product.empty = true;
    } else {
      var total = await userCartHelper.getTotalAmount(req.session.user._id);
    }
    let Category =await adminHelper.getCatagory()

    res.render("userSide/cart", { product, user: req.session.user, total,cartCount,
      whislistCount,
      bracket,
      Category
    });
  },

  addToCart: (req, res) => {
    if (req.session.userLogin) {
      userCartHelper.addCart(req.params.id, req.session.user._id).then(() => {
        res.json({ status: true });
      });
    } else {
      res.json({ status: false });
    }
  },

  changeQuantyCart: (req, res) => {
    userCartHelper.changeQuantity(req.body).then(async (response) => {
      // response.total = await userCartHelper.getTotalAmount(req.session.user._id);
      res.json(response);
    })
  },

  removeItemCart: (req, res) => {
    userCartHelper
      .deleteCartItem(req.session.user._id, req.params.id)
      .then(() => {
        res.json({});
      });
  },
};

