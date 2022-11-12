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
        })
        .catch((err) => {
          reject(err);
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
              orderDate: fmtDate,
              "products.paymentStatus": {
                $ne: "order cancelled",
              },
              "products.product": productId,
            },
          },
          {
            $unwind: "$products",
          },
          {
            $match: {
              "products.product": {
                $eq: productId,
              },
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "products.product",
              foreignField: "_id",
              as: "soldItem",
            },
          },
          {
            $unwind: "$soldItem",
          },
          {
            $project: {
              _id: 1,
              name: "$soldItem.name",
              description: "$soldItem.Description",
              price: "$soldItem.offerPrice",
              quantity: "$products.quantity",
            },
          },
          {
            $group: {
              _id: {
                price: "$price",
                name: "$name",
              },
              qtysum: {
                $sum: "$quantity",
              },
              itemcount: {
                $count: {},
              },
            },
          },
        ])
        .toArray();
      resolve(productInfo);
    });
  },

  //month sales report
  monthSalesReport: (proId, date) => {
    return new Promise(async (resolve, reject) => {
      let monthReport = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              products: {
                $elemMatch: {
                  product: proId,
                  paymentStatus: { $ne: "Order Cancelled" },
                },
              },
            },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              totalAmount: 1,
              products: "$products.product",
              quantity: "$products.quantity",
              month: 1,
            },
          },
          {
            $match: {
              month: date,
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "products",
              foreignField: "_id",
              as: "productSold",
            },
          },
          {
            $project: {
              totalAmount: 1,
              orderDate: 1,
              quantity: 1,
              productSold: { $arrayElemAt: ["$productSold", 0] },
            },
          },
          {
            $project: {
              totalAmount: 1,
              orderDate: 1,
              productname: "$productSold.name",
              quantity: 1,
            },
          },
          {
            $group: {
              _id: {
                totalAmount: "$totalAmount",
                orderDate: "$orderDate",
                productname: "$productname",
                quantity: "$quantity",
              },
              count: { $count: {} },
            },
          },
          {
            $project: {
              prdoductname: "$_id.productname",
              orderDate: "$_id.orderDate",
              totalAmount: "$_id.totalAmount",
              quantity: "$_id.quantity",
              count: 1,
              totalSold: { $sum: ["$quantity", "$count"] },
              _id: 0,
            },
          },
        ])
        .toArray();
      resolve(monthReport);
    });
  },

  //yearly sales report
  yearSalesReport: (proId, date) => {
    return new Promise(async (resolve, reject) => {
      let yearReport = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              products: {
                $elemMatch: {
                  product: proId,
                  paymentStatus: { $ne: "Order Cancelled" },
                },
              },
            },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              totalAmount: 1,
              products: "$products.product",
              quantity: "$products.quantity",
              orderDate: 1,
              year: { $toString: "$year" },
            },
          },
          {
            $match: {
              year: date,
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "products",
              foreignField: "_id",
              as: "productSold",
            },
          },
          {
            $project: {
              totalAmount: 1,
              orderDate: 1,
              quantity: 1,
              productSold: { $arrayElemAt: ["$productSold", 0] },
            },
          },
          {
            $project: {
              totalAmount: 1,
              orderDate: 1,
              productname: "$productSold.name",
              quantity: 1,
            },
          },
          {
            $group: {
              _id: {
                totalAmount: "$totalAmount",
                orderDate: "$orderDate",
                productname: "$productname",
                quantity: "$quantity",
              },
              count: { $count: {} },
            },
          },
          {
            $project: {
              prdoductname: "$_id.productname",
              orderDate: "$_id.orderDate",
              totalAmount: "$_id.totalAmount",
              quantity: "$_id.quantity",
              count: 1,
              totalSold: { $sum: ["$quantity", "$count"] },
              _id: 0,
            },
          },
        ])
        .toArray();
      resolve(yearReport);
    });
  },

  //--------------- add coupen section ----------//
  addCoupon: (couponDetails) => {
    return new Promise(async (resolve, reject) => {
      let coupon = await db
        .get()
        .collection(collection.COUPON_COLLECTION)
        .findOne({ couponCode: couponDetails.couponCode });
      if (coupon) {
        console.log("coupn is already exist");
      } else {
        db.get()
          .collection(collection.COUPON_COLLECTION)
          .insertOne(couponDetails)
          .then((response) => {
            console.log("coupen is created");
            resolve(response);
          });
      }
    });
  },
  // -----------coupon view -----------//
  copuonView: () => {
    return new Promise(async (resolve, reject) => {
      let couponCollection = await db
        .get()
        .collection(collection.COUPON_COLLECTION)
        .find()
        .toArray();
      resolve(couponCollection);
    });
  },

  //---------------coupon edit view page-------//
  editCoupon: (couponId) => {
    return new Promise(async (resolve, reject) => {
      let singleCoupon = await db
        .get()
        .collection(collection.COUPON_COLLECTION)
        .findOne({ _id: objectID(couponId) });
      resolve(singleCoupon);
    });
  },
  updateCoupon: (couponDetails, couponId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.COUPON_COLLECTION)
        .updateOne(
          { _id: objectID(couponId) },
          {
            $set: {
              couponCode: couponDetails.couponCode,
              description: couponDetails.description,
              value: couponDetails.value,
              date: couponDetails.date,
              type: couponDetails.type,
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },
  //-------------delete coupon------------//\
  deleteCoupon: (couponId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.COUPON_COLLECTION)
        .deleteOne({ _id: objectID(couponId) })
        .then(() => {
          resolve();
        });
    });
  },
  //----------------catagory offer -----------//
  catagoryOffer: (catagories, percentage) => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find({ Category: catagories })
        .toArray();
      for (i = 0; i < products.length; i++) {
        let offerPrice =
          products[i].offerPrice - (products[i].offerPrice * percentage) / 100;
        await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .updateOne(
            { _id: objectID(products[i]._id) },
            {
              $set: {
                offerPrice: offerPrice,
              },
            }
          )
          .then(() => {
            resolve();
          });
      }
    });
  },

  //-----------product offer------//
  productOffer: (percentage, proId) => {
    console.log(proId);
    return new Promise(async (resolve, reject) => {
      let product = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ _id: objectID(proId) });
      console.log(product);
      let offerPrice =
        product.offerPrice - (product.offerPrice * percentage) / 100;
      await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateOne(
          { _id: objectID(proId) },
          {
            $set: {
              offerPrice: offerPrice,
            },
          }
        )
        .then((response) => {
          console.log(response);
          resolve();
        });
    });
  },
};
