var db = require("../config/connection");
var collection = require("../config/collection");
const { format } = require("morgan");
const Couponcodes = require("voucher-code-generator");
const { NetworkContext } = require("twilio/lib/rest/supersim/v1/network");
// const bcrypt = require('bcrypt')
var objectID = require("mongodb").ObjectId;

//category

module.exports = {
  addCategories: (Categorylist) => {
    return new Promise(async (resolve, reject) => {
      let catagoryExist = await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .findOne({ categories: Categorylist.categories });
      if (catagoryExist) {
        data = {};
        data.catagoryExist = true;
        resolve(data);
      } else {
        db.get()
          .collection(collection.CATEGORY_COLLECTION)
          .insertOne(Categorylist)
          .then((data) => {
            resolve(data);
          });
      }
    });
  },
  viewCategories: (pageNum,perPage) => {
    return new Promise(async (resolve, reject) => {
      let catagorlist = await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .find()
        .skip((pageNum - 1) * perPage)
        .limit(perPage)
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
  getCatagoryCount :() =>{
    return new Promise(async (resolve, reject) => {
      let catagoryCount = await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .find()
        .count()
        resolve(catagoryCount)
    })
  },
  //sub catagory
  getCatagory : () => {
    return new Promise(async (resolve, reject) => {
      let catagorlist = await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .find()
        .toArray()
        resolve(catagorlist)
    })
  },

  catagorySelection:(catagoryName) => {
    return new Promise(async(resolve,reject) => { 
      let subCatagoryList = await db
      .get()
      .collection(collection.CATEGORY_COLLECTION)
      .findOne({categories:catagoryName})
      resolve(subCatagoryList)
    })
  },

  addSubCatagory : (details) =>{
    return new Promise((resolve,reject) => {
      db.get().collection(collection.CATEGORY_COLLECTION).updateOne({categories : details.catagory},{
        $push: {
          subCatagories:{name:details.subCatagoryName}
        }
      }).then((response)=>{
        resolve(response)
      })
    })
  },

  deleteSubCatagory :(details) =>{
    return new Promise((resolve,reject) => {
      db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id: objectID(details.cataId)},{
        $pull:{subCatagories:{name : details.cataName}}
      }).then((response) => {
        resolve(response)
      })
    })
  },
  //products
  addProduct: (products) => {
    products.stock = parseInt(products.stock);
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .insertOne(products)
        .then(() => {
          resolve();
        });
    });
  },
  viewProduct: (pageNum,perPage) => {
    return new Promise(async (resolve, reject) => {
      let product = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find()
        .skip((pageNum - 1) * perPage)
        .limit(perPage)
        .toArray();
      resolve(product);
    });
  },

  productsCount : () =>{
    return new Promise(async (resolve,reject) => {
      let proCount = await db.get().collection(collection.PRODUCT_COLLECTION).count()
      resolve(proCount)
    })
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
      // productDetails = parseInt(productDetails.stock)
      if(productDetails.imagefileName.length > 0){
        db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateOne(
          { _id: objectID(proId) },
          {
            $set: {
              name: productDetails.name,
              Description: productDetails.Description,
              Category: productDetails.Category,
              subCategory: productDetails.subCategory,
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
      }
      else{
  
        db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateOne(
          { _id: objectID(proId) },
          {
            $set: {
              name: productDetails.name,
              Description: productDetails.Description,
              Category: productDetails.Category,
              subCategory: productDetails.subCategory,
              price: productDetails.price,
              offerPrice: productDetails.offerPrice,
              stock: productDetails.stock,
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
      }
     
    });
  },

  deleteProduct: (proId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .deleteOne({ _id: objectID(proId) })
        .then((response) => {
          db.get().collection(collection.ORDER_COLLECTION).updateMany({"products.product": objectID(proId)},  {
            $set: {
              "products.$.delete": true,
            },
          }).then((response)=>{
            resolve(response);
          })
        });
    });
  },

  findProductDetails: (proId) => {
    return new Promise((resolve, reject) => {
      try {
        var prodObjId = objectID(proId);
      } catch (error) {
        reject(error)
      }
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ _id:  prodObjId})
        .then((product) => {
          resolve(product);
        }).catch(err => {
          console.log(errrs);
        });
    });
  },

  //customer
  viewUser: (pageNum,perPage) => {
    return new Promise(async (resolve, reject) => {
      let users = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .find()
        .skip((pageNum - 1) * perPage)
        .limit(perPage)
        .toArray();
      resolve(users);
    });
  },

  //count user
  getCountUser : () =>{
    return new Promise(async (resolve, reject) => {
      var docCount = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .find()
        .count();
      resolve(docCount);
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
  viewBanner: (pageNum,perPage) => {
    return new Promise(async (resolve, reject) => {
      let banner = await db
        .get()
        .collection(collection.BANNER_COLLECTION)
        .find()
        .skip((pageNum - 1) * perPage)
        .limit(perPage)
        .toArray();
      resolve(banner);
    });
  },
  //banner count
  bannerCount :() =>{
    return new Promise(async (resolve, reject) => {
      orderCount = await db
        .get()
        .collection(collection.BANNER_COLLECTION)
        .find().count()
        resolve(orderCount)
    }) 
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

  //card revenue result
  revenue: () => {
    return new Promise(async (resolve, reject) => {
      let revenue = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $group: {
              _id: 0,
              sum: { $sum: "$totalAmount" },
            },
          },
        ])
        .toArray();
      resolve(revenue);
    });
  },

  //card total order result
  totalOrder: () => {
    return new Promise(async (resolve, reject) => {
      let total = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          { $unwind: "$products" },
          { $group: { _id: "products", sum: { $sum: 1 } } },
        ])
        .toArray();
      resolve(total);
    });
  },

  //payment graph result
  paymenttotal: () => {
    return new Promise(async (resolve, reject) => {
      let paymentGraph = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $project: {
              totalAmount: 1,
              paymentMethod: 1,
            },
          },
          {
            $group: {
              _id: "$paymentMethod",
              totalAmount: { $sum: "$totalAmount" },
            },
          },
        ])
        .toArray();
      resolve(paymentGraph);
    });
  },

  
  //get product details for sales reports
  getproductsForReport : () => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find()
        .toArray()
        resolve(products)
    })
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
              month: date,
              "products.paymentStatus": {
                $ne: "order cancelled",
              },
              "products.product": proId,
            },
          },
          {
            $unwind: "$products",
          },
          {
            $match: {
              "products.product": {
                $eq: proId,
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
      resolve(monthReport);
    });
  },

  //yearly sales report
  yearSalesReport: (proId, date) => {
    year = parseInt(date);
    return new Promise(async (resolve, reject) => {
      let yearReport = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              year: year,
              "products.paymentStatus": {
                $ne: "order cancelled",
              },
              "products.product": proId,
            },
          },
          {
            $unwind: "$products",
          },
          {
            $match: {
              "products.product": {
                $eq: proId,
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
      resolve(yearReport);
    });
  },

  //--------------- add coupen section ----------//
  addCoupon: (couponDetails) => {
    return new Promise(async (resolve, reject) => {
      // let coupon = await db
      //   .get()
      //   .collection(collection.COUPON_COLLECTION)
      //   .findOne({ couponCode: couponDetails.couponCode });
        codeGeneraor = Couponcodes.generate({
          length: 8,
        });
        couponDetails.couponCode = codeGeneraor[0]
        db.get()
          .collection(collection.COUPON_COLLECTION)
          .insertOne(couponDetails)
          .then((response) => {
            resolve(response);
          });
      }
    );
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
              upto:couponDetails.upto,
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
    return new Promise(async (resolve, reject) => {
      let product = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ _id: objectID(proId) });
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
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};
