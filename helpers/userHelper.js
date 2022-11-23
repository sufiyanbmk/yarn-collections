var db = require("../config/connection");
var collection = require("../config/collection");
const bcrypt = require("bcrypt");
const { response } = require("../app");
// const { ObjectID } = require('bson')
const objectID = require("mongodb").ObjectId;

const referalcode = require("referral-codes");

module.exports = {
  dosignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      userData.password = await bcrypt.hash(userData.password, 10);
      db.get()
        .collection(collection.USER_COLLECTION)
        .findOne({ email: userData.email })
        .then(async (response) => {
          if (response) {
            resolve(response);
          } else {
            userData.banned = false;
            userData.Address = [];
            if (userData.referralCode) {
              let referaluser = await db
                .get()
                .collection(collection.USER_COLLECTION)
                .findOne({ referralCode: userData.referralCode });
              if (referaluser) {
                userData.referralCode = referalcode
                  .generate({
                    prefix: userData.name,
                  })[0]
                  .replaceAll(" ", "");
                db.get()
                  .collection(collection.USER_COLLECTION)
                  .insertOne(userData)
                  .then((data) => {
                    wallet = {
                      user: data.insertedId,
                      Total: 0,
                      History: [
                        {
                          RefferdFrom: referaluser._id,
                          user: referaluser.name,
                          credited: 10,
                          Time: new Date(),
                        },
                      ],
                    };
                    db.get()
                      .collection(collection.WALLET_COLLECTION)
                      .insertOne(wallet);
                    db.get()
                      .collection(collection.WALLET_COLLECTION)
                      .updateOne(
                        { user: referaluser._id },
                        {
                          $inc: { Total: 10 },
                          $push: {
                            History: {
                              RefferdTo: data.insertedId,
                              name: userData.name,
                              credited: 10,
                              Time: new Date(),
                            },
                          },
                        }
                      );
                    resolve(data);
                  });
              } else {
                reject();
              }
            } else {
              userData.referralCode = referalcode
                .generate({
                  prefix: userData.name,
                })[0]
                .replaceAll(" ", "");
              db.get()
                .collection(collection.USER_COLLECTION)
                .insertOne(userData)
                .then((data) => {
                  console.log(data);
                  wallet = {
                    user: data.insertedId,
                    Total: 10,
                    History: [],
                  };
                  db.get()
                    .collection(collection.WALLET_COLLECTION)
                    .insertOne(wallet);
                  resolve(data);
                });
            }
          }
        });
    });
  },
  dologin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let loginstatus = false;
      let response = {};
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ email: userData.email });
      if (user) {
        if (user.banned == false) {
          bcrypt.compare(userData.password, user.password).then((status) => {
            if (status) {
              response.user = user;
              response.status = true;
              resolve(response);
            } else {
              console.log("login failed");
              resolve({ status: false });
            }
          });
        } else {
          console.log("banned failed");
          resolve({ status: false });
        }
      } else {
        console.log("login failed");
        resolve({ status: false });
      }
    });
  },

  otp: (userNum) => {
    let response = {};
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .findOne({ phoneNo: userNum })
        .then((response) => {
          if (response) {
            if (response.banned == false) {
              response.status = true;
              response.user = response.name;
              resolve(response);
            } else {
              console.log("blocked user");
              response.status = false;
              resolve(response);
            }
          } else {
            console.log("failed");
            resolve(response);
          }
        });
    });
  },

  //get banners in user side
  getBanner : () =>{
    return new Promise(async (resolve, reject) => {
      let banner = await db
        .get()
        .collection(collection.BANNER_COLLECTION)
        .find()
        .toArray()
        resolve(banner)
    })
  },

  //top selling products
  topProducts : ()=>{
    return new Promise(async(resolve,reject) => {
      let topSellingProduct = await db.get().collection(collection.ORDER_COLLECTION)
      .aggregate([
        {
          $match:{
            status:"Success"
          }
        },
        {
          $unwind:'$products'
        },
        {
          $group:{
            _id: "$products.product",
            total :{$sum:"$products.quantity"}
          }
        },
        {
          $sort:{total:-1}
        },
        {
          $limit:4
        },
        {
          $lookup:{
            from:collection.PRODUCT_COLLECTION,
            localField:"_id",
            foreignField:"_id",
            as:"product"
          }
        },
        {
          $addFields:{
            products:{$arrayElemAt:["$product",0]}
          }
        },
        {
          $project:{
            _id:0,
            total:1,
            products:1
          }
        }
      ]).toArray()
      resolve(topSellingProduct)
    })
  },

  // catagory wise product
  getCatagoryProducts: (catagory) => {
    return new Promise(async (resolve, reject) => {
      let product = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find({ Category: catagory })

        // .skip((pageNum - 1) * perPage)
        // .limit(perPage)
        .toArray();

      resolve(product);
    });
  },

  // document count
  getCatagoryProductsCount: (catagory) => {
    return new Promise(async (resolve, reject) => {
      var docCount = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find({ Category: catagory })
        .count();
      resolve(docCount);
    });
  },

  //user profile
  userProfile: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: objectID(userId) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  //edit profile
  editProfile: (userId, user) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: objectID(userId) },
          {
            $set: {
              name: user.name,
              email: user.email,
              phoneNo: user.phone,
            },
          }
        )
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },
  //password change
  passwordChange: (userId, userpsw) => {
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: objectID(userId) });
      if (user) {
        bcrypt.compare(userpsw.password, user.password).then(async (status) => {
          if (status) {
            userpsw.npassword = await bcrypt.hash(userpsw.npassword, 10);
            db.get()
              .collection(collection.USER_COLLECTION)
              .updateOne(
                { _id: objectID(userId) },
                {
                  $set: {
                    password: userpsw.npassword,
                  },
                }
              )
              .then((response) => {
                console.log(response);
                resolve(response);
              });
          } else {
            resolve({ status: false });
          }
        });
      }
    });
  },

  //user product sub catagory
  subCatagoryProd:(catagories)=>{
    return new Promise(async (resolve, reject) => {
      let catagory = await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .find({ categories: catagories })
        .toArray();
      resolve(catagory);
    });
  },

  //--------wallet showing in user side ------//
  getWallet: (userId) => {
    return new Promise((resolve, reject) => {
      let walletDetails = db
        .get()
        .collection(collection.WALLET_COLLECTION)
        .findOne({ user: objectID(userId) });
      resolve(walletDetails);
    });
  },

  //-------cart count--------------//
  getCartCount: (userId) => {
    let count = 0;
    return new Promise(async (resolve, reject) => {
      let cartCount = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectID(userId) });
      if (cartCount) {
        count = cartCount.products.length;
      }
      resolve(count);
    });
  },
  //-------whislist count------//
  getWhislistCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let wishlist = await db
        .get()
        .collection(collection.WHISLIST_COLLECTION)
        .findOne({ user: objectID(userId) });
      if (wishlist) {
        count = wishlist.product.length;
      }
      resolve(count);
    });
  },
  //-----wallet history----//
  userWalletHistory:(walletId)=>{
    return new Promise(async(resolve,reject) => {
      let history = await db.get().collection(collection.WALLET_COLLECTION).findOne({_id:objectID(walletId)})
      resolve(history)
    })
  }
};
