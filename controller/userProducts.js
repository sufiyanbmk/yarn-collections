const userHelper = require("../helpers/userHelper");
const adminHelper = require("../helpers/adminHelper");
const whislistHelper = require("../helpers/whislistHelper");
const userCartHelper = require("../helpers/userCartHelper");
const { render } = require("../app");

module.exports = {
  getCatagoryProducts: async (req, res, next) => {
    try {
      const pageNum = req.query.page;
      const perPage = 3;
      let products = await userHelper.getCatagoryProducts(
        req.params.catagory,
        // pageNum,
        // perPage
      );
      let count = await userHelper.getCatagoryProductsCount(
        req.params.catagory
      );
      // let pages = Math.ceil(count / perPage);
      // let pagesArray = Array.from({ length: pages }, (_, i) => i + 1);
      let subCatagoryProduct = await userHelper.subCatagoryProd(req.params.catagory)
      if (req.session.user) {
        let [whislist] = await whislistHelper.getuserWhislist(
          req.session.user._id
         );
         
        if (whislist) {
          for (i = 0; i < products.length; i++) {
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
  
        let cartItem = await userCartHelper.gotoCart(req.session.user._id) 
        products.forEach((element)=>{
          cartItem.forEach((item)=>{
            console.log(item.products.product)
            if(element._id.equals(item.products.product)){
              element.cartList = true;
            }
          })
        })
      }
      let cartCount = null;
      let whislistCount = null;
      let bracket;
      if (req.session.userLogin) {
        cartCount = await userHelper.getCartCount(req.session.user._id);
        whislistCount = await userHelper.getWhislistCount(req.session.user._id);
         bracket = true
       }
       let Category =await adminHelper.getCatagory()
      res.render("userSide/women", {
        products,
        user: req.session.user,
        // pagesArray,
        cartCount,
        whislistCount,
        bracket,
        subCatagoryProduct,
        Category
      });
    } catch (error) {
      next(error);
    }
  },

  singleProduct: async (req, res, next) => {
    try {
      let cartCount = null;
      let whislistCount = null;
      let bracket;
      let existCart = false;
      if (req.session.userLogin) {
        cartCount = await userHelper.getCartCount(req.session.user._id);
        whislistCount = await userHelper.getWhislistCount(req.session.user._id);
         bracket = true
         existCart = await userCartHelper.cartThere(req.session.user._id,req.params.id)
         console.log(existCart)
      }
      adminHelper.findProductDetails(req.params.id).then((data) => {
        if(data.stock == 0){
          data.noStock = true;
           }else if(data.stock <= 5){
          data.stockExist = true;
        }
        res.render("userSide/singleProduct", { data, user: req.session.user ,cartCount,whislistCount,bracket,existCart});
      }).catch(err => {
        next(err)
      });
    } catch (error) {
      console.log("errorr");
      next(error);
    }
  },
};
