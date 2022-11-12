const userHelper = require("../helpers/userHelper");
const adminHelper = require("../helpers/adminHelper");

module.exports = {
  getWomenProduct: async (req, res) => {
    let products = await userHelper.getCatagoryProducts(req.params.catagory);
    console.log(products);
    res.render("userSide/women", { products, user: req.session.user });
  },

  getKidsProduct: async (req, res) => {
    let products = await userHelper.getCatagoryProducts(req.params.catagory);
    res.render("userSide/kidsProduct", { products, user: req.session.user });
  },

  getMensProduct: async (req, res) => {
    let products = await userHelper.getCatagoryProducts(req.params.catagory);
    res.render("userSide/menProduct", { products, user: req.session.user });
  },

  singleProduct: (req, res) => {
    adminHelper.findProductDetails(req.params.id).then((data) => {
      res.render("userSide/singleProduct", { data, user: req.session.user });
    });
  },
};
