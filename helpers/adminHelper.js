var db = require("../config/connection");
var collection = require("../config/collection");
const { response } = require("express");
const { format } = require("morgan");
// const bcrypt = require('bcrypt')
var objectID = require("mongodb").ObjectId;

//category

module.exports = {
  addCategories: (Categorylist) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .insertOne(Categorylist)
        .then((data) => {
          resolve(data);
        });
    });
  },
  viewCategories: () => {
    return new Promise(async (resolve, reject) => {
      let catagorlist = await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .find()
        .toArray();
      resolve(catagorlist);
    });
  },
  getCategoryDetails: (user) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .findOne({ _id: objectID(user) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  updatedCategory: (catagoryid, details) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .updateOne(
          { _id: objectID(catagoryid) },
          {
            $set: {
              categories: details.categories,
              Description: details.Description,
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },
  deletecategory: (deleteid) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .deleteOne({ _id: objectID(deleteid) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  //products
  addProduct: (products) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .insertOne(products)
        .then(() => {
          resolve();
        });
    });
  },
  viewProduct: () => {
    return new Promise(async (resolve, reject) => {
      let product = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find()
        .toArray();
      resolve(product);
    });
  },

  getProduct: (proId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ _id: objectID(proId) })
        .then((product) => {
          resolve(product);
        });
    });
  },

  updateProduct: (proId, productDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateOne(
          { _id: objectID(proId) },
          {
            $set: {
              name: productDetails.name,
              Description: productDetails.Description,
              category: productDetails.category,
              price: productDetails.price,
              offerPrice: productDetails.offerPrice,
              stock: productDetails.stock,
              imagefileName: productDetails.imagefileName,
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },

  deleteProduct: (proId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .deleteOne({ _id: objectID(proId) })
        .then((response) => {
          resolve(response);
        });
    });
  },

  findProductDetails: (proId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ _id: objectID(proId) })
        .then((product) => {
          resolve(product);
        });
    });
  },

  //customer
  viewUser: () => {
    return new Promise(async (resolve, reject) => {
      let users = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .find()
        .toArray();
      resolve(users);
    });
  },

  banUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: objectID(userId) },
          {
            $set: {
              banned: true,
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },

  unbanUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: objectID(userId) },
          {
            $set: {
              banned: false,
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },
  // add banners
  addBanner: (banner) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.BANNER_COLLECTION)
        .insertOne(banner)
        .then(() => {
          resolve();
        });
    });
  },
  viewBanner: () => {
    return new Promise(async (resolve, reject) => {
      let banner = await db
        .get()
        .collection(collection.BANNER_COLLECTION)
        .find()
        .toArray();
      resolve(banner);
    });
  },
  //delete banner
  deleteBanner: (deleteid) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.BANNER_COLLECTION)
        .deleteOne({ _id: objectID(deleteid) })
        .then((response) => {
          resolve(response);
        });
    });
  },

  // get stats admin dasboard
  getGraphData: () => {
    return new Promise(async (resolve, reject) => {
      var graphDta = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $project: {
              day: {
                $dayOfMonth: {
                  $dateFromString: {
                    dateString: "$orderDate",
                  },
                },
              },
              month: {
                $month: {
                  $dateFromString: {
                    dateString: "$orderDate",
                  },
                },
              },
              year: {
                $year: {
                  $dateFromString: {
                    dateString: "$orderDate",
                  },
                },
              },
            },
          },
          {
            $group: {
              _id: { day: "$day", month: "$month", year: "$year" },
              count: { $sum: 1 },
            },
          },
        ])
        .toArray();
      resolve(graphDta);
    });
  },
  //pie chart for payment
  getPieData: () => {
    return new Promise(async (resolve, reject) => {
      let count = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $group: { _id: "$paymentMethod", sum: { $sum: 1 } },
          },
          {
            $project: { _id: 1, sum: 1 },
          },
        ])
        .toArray();

      resolve(count);
    });
  },

  //sales report day
  daySalesReport: async (productId, date) => {
    var fmtDate = date.replace(/(\d{4})\-(\d{2})\-(\d{2})/gm, "$2/$3/$1");
    return new Promise(async (resolve, reject) => {
      let productInfo = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              products: {
                $elemMatch: {
                  product: productId,
                  paymentStatus: { $ne: "Order Cancelled" },
                },
              },
              orderDate: fmtDate,
            },
          },
          { $count: "count" },
        ])
        .toArray();
      console.log(productInfo);
      resolve(productInfo);
    });
  },
};
