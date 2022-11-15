const userHelper = require("../helpers/userHelper");
const adminHelper = require("../helpers/adminHelper");
const whislistHelper = require("../helpers/whislistHelper");
const userCartHelper = require("../helpers/userCartHelper");

module.exports = {
  getCatagoryProducts: async (req, res) => {
    const cartExist = false;
    const pageNum = req.query.page;
    const perPage = 2;
    let products = await userHelper.getCatagoryProducts(
      req.params.catagory,
      pageNum,
      perPage
    );
    let count = await userHelper.getCatagoryProductsCount(req.params.catagory);
    let pages = Math.ceil(count / perPage);
    let pagesArray = Array.from({ length: pages }, (_, i) => i + 1);
    if (req.session.user) {
      let [whislist] = await whislistHelper.getuserWhislist(
        req.session.user._id
      );
      if (whislist) {
        for (i = 0; i < products.length; i++) {
          // products[i].cart_id = cart._id
          for (j = 0; j < whislist.product.length; j++) {
            let a = "" + products[i]._id;
            let b = "" + whislist.product[j];
            if (a == b) {
              products[i].wishlist = true;
              break;
            } else {
              products[i].wishlist = false;
            }
          }
        }
      }
    }
    // let banner = await adminHelper.viewBanner();
    res.render("userSide/women", {
      products,
      user: req.session.user,
      pagesArray,
    });
  },

  singleProduct: (req, res) => {
    adminHelper.findProductDetails(req.params.id).then((data) => {
      res.render("userSide/singleProduct", { data, user: req.session.user });
    });
  },
};
