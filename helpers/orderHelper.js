var db = require("../config/connection");
var collection = require("../config/collection");
const { response } = require("../app");
const { PRODUCT_COLLECTION } = require("../config/collection");
const objectID = require("mongodb").ObjectId;
const Razorpay = require("razorpay");
const { resolve } = require("path");
let paypal = require("paypal-rest-sdk");
const e = require("express");
const { ObjectID } = require("bson");

var instance = new Razorpay({
  key_id: "rzp_test_oXgNaRuBSLuUSI",
  key_secret: "fqXJij2KfofxWAEJ9wpserCl",
});

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "ASg0UcR7OpK-QmnHuRYeY8A8KJquLUMSktx2yIDO-Svx-WjKOBFk3W4kgC2NlZH26qlAPNdxdRRS5Dm_",
  client_secret:
    "EJwPOmZd2IYqfHckowKAV5w7j7wv0m9xt48RRdhL5yZ7OiAnIE-eG5tamKkPNNufwEUUK23tMiQ7t6af",
});

module.exports = {
  addAddress: (userId, details, addressID) => {
    addressForm = {
      user: objectID(userId),
      details: details,
      addressID: addressID,
    };
    return new Promise((resolve, reject) => {
      details.defaultAddress = false;
      db.get()
        .collection(collection.ADDRESS_COLLECTION)
        .insertOne(addressForm)
        .then(() => {
          resolve(response);
        });
    });
  },
  getAddress: (userId) => {
    return new Promise(async (resolve, reject) => {
      let addressDetails = await db
        .get()
        .collection(collection.ADDRESS_COLLECTION)
        .find({ user: objectID(userId) })
        .toArray();
      if (addressDetails != null) {
        resolve(addressDetails);
      } else {
        resolve();
      }
    });
  },
  getAddresByID: (Id) => {
    return new Promise(async (resolve, reject) => {
      let addressDetails = await db
        .get()
        .collection(collection.ADDRESS_COLLECTION)
        .findOne({ addressID: Id });
      if (addressDetails != null) {
        resolve(addressDetails);
      } else {
        resolve();
      }
    });
  },
  //deleete address
  deleteAddress: (addressId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ADDRESS_COLLECTION)
        .deleteOne({ _id: objectID(addressId) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  getCartProductList: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: objectID(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $lookup: {
              from: PRODUCT_COLLECTION,
              localField: "products.product",
              foreignField: "_id",
              as: "singleProduct",
            },
          },
          {
            $project: {
              product: "$products.product",
              quantity: "$products.quantity",
              products: { $arrayElemAt: ["$singleProduct", 0] },
            },
          },
          {
            $addFields: {
              price: { $toInt: ["$products.offerPrice"] },
            },
          },
          {
            $project: {
              _id: 0,
              product: 1,
              quantity: 1,
              price: 1,
              total: {
                $sum: { $multiply: ["$quantity", "$price"] },
              },
            },
          },
        ])
        .toArray();
      resolve(cart);
    });
  },
  //place order
  placeOrder: (order, products, address, total) => {
    return new Promise((resolve, reject) => {
      products.forEach((Element) => {
        Element.paymentStatus = "order placed";
      });
      let status = order.paymentMethod === "COD" ? "Success" : "pending";
      let orderObj = {
        address: {
          name: address.details.fname,
          country: address.details.country,
          state: address.details.state,
          city: address.details.city,
          pincode: address.details.pincode,
          phone: address.details.phone,
          email: address.details.email,
        },
        userId: objectID(order.userId),
        paymentMethod: order.paymentMethod,
        totalAmount: total,
        couponAmt: order.couponAmt,
        products: products,
        status: status,
        orderDate: new Date().toLocaleDateString("en-US", {
          timeZone: "Asia/Kolkata",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
        orderTime: new Date().getHours() + ":" + new Date().getMinutes(),
        month:
          new Date().getFullYear() + "-" + Number(new Date().getMonth() + 1),
        year: new Date().getFullYear(),
        time: new Date().getTime(),
      };
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .insertOne(orderObj)
        .then((response) => {
          // db.get()
          //   .collection(collection.CART_COLLECTION)
          //   .deleteOne({ user: objectID(order.userId) });
          products.forEach((element) => {
            element.quantity = parseInt(element.quantity);
            db.get()
              .collection(collection.PRODUCT_COLLECTION)
              .updateOne(
                { _id: objectID(element.product) },
                {
                  $inc: { stock: -element.quantity },
                }
              );
          });

          resolve(response.insertedId);
        });
    });
  },
  //view orderlist
  viewOrderList: (userId) => {
    return new Promise(async (resolve, reject) => {
      order = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              $and: [
                { userId: objectID(userId) },
                {
                  products: {
                    $elemMatch: {
                      paymentStatus: "order placed",
                    },
                  },
                },
              ],
            },
          },
          { $unwind: "$products" },
          {
            $project: {
              name: "$address.name",
              mobile: "$address.phone",
              productTotal: "$products.total",
              paymentMethod: 1,
              paymentStatus: "$products.paymentStatus",
              products: "$products.product",
              quantity: "$products.quantity",
              totalAmount: 1,
              orderDate: 1,
              time: 1,
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "products",
              foreignField: "_id",
              as: "cartItems",
            },
          },
          {
            $project: {
              name: 1,
              mobile: 1,
              paymentMethod: 1,
              paymentStatus: 1,
              product: 1,
              quantity: 1,
              productTotal: 1,
              totalAmount: 1,

              orderDate: 1,
              time: 1,
              products: { $arrayElemAt: ["$cartItems", 0] },
            },
          },
          {
            $sort: {
              time: -1,
            },
          },
        ])
        .toArray();

      resolve(order);
    });
  },

  //order history
  orderhistory: (userId, pageNum, perPage) => {
    console.log(pageNum);
    return new Promise(async (resolve, reject) => {
      orderHistory = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              userId: objectID(userId),
            },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              Amount: 1,
              Mobile: 1,
              payment: 1,
              status: "$products.paymentStatus",
              product: "$products.product",
              quantity: "$products.quantity",
              orderDate: 1,
              time: 1,
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "product",
              foreignField: "_id",
              as: "cartItems",
            },
          },
          {
            $project: {
              Amount: 1,
              Mobile: 1,
              payment: 1,
              status: 1,
              orderDate: 1,
              time: 1,
              product: 1,
              products: {
                $arrayElemAt: ["$cartItems", 0],
              },
            },
          },
          {
            $sort: {
              time: -1,
            },
          },
          {
            $skip: (pageNum - 1) * perPage,
          },
          {
            $limit: perPage,
          },
        ])
        .toArray();
      console.log(orderHistory);
      resolve(orderHistory);
    });
  },

  // user cancel order
  orderCancel: (id, userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          {
            $and: [
              {
                _id: objectID(id),
              },
              {
                products: {
                  $elemMatch: {
                    paymentStatus: "order placed",
                  },
                },
              },
            ],
          },
          {
            $set: {
              "products.$.paymentStatus": "Order Cancelled",
            },
          }
        )
        .then(() => {
          db.get()
            .collection(collection.ORDER_COLLECTION)
            .findOne({ _id: ObjectID(id) })
            .then((order) => {
              order.products.forEach((element) => {
                db.get()
                  .collection(collection.PRODUCT_COLLECTION)
                  .updateOne(
                    { _id: ObjectID(element.product) },
                    {
                      $inc: { stock: element.quantity },
                    }
                  )
                  .then((result) => {
                    db.get()
                      .collection(collection.ORDER_COLLECTION)
                      .findOne({ _id: ObjectID(id) })
                      .then((order) => {
                        db.get()
                          .collection(collection.WALLET_COLLECTION)
                          .updateOne(
                            { user: ObjectID(userId) },
                            {
                              $inc: {
                                Total: order.totalAmount,
                              },
                            }
                          )
                          .then((hai) => {});
                      });
                  });
              });
            });
          resolve();
        });
    });
  },
  //admin order
  adminorderlist: () => {
    return new Promise(async (resolve, reject) => {
      order = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find()
        .toArray();
      resolve(order);
    });
  },
  //admin product list
  adminViewDetails: (orderId) => {
    return new Promise(async (resolve, reject) => {
      singleItems = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              _id: objectID(orderId),
            },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              product: "$products.product",
              userId: 1,
              status: "$products.paymentStatus",
              quantity: "$products.quantity",
              paymentMethod: 1,
              totalAmount: 1,
              productTotal: "$products.Total",
              addressName: "$address.name",
              addressCountru: "$address.country",
              addressState: "$address.state",
              addressPincode: "$address.pincode",
              addressPhone: "$address.phone",
              adddressEmail: "$address.email",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "product",
              foreignField: "_id",
              as: "cartItems",
            },
          },
          {
            $project: {
              product: 1,
              userId: 1,
              product: 1,
              status: 1,
              quantity: 1,
              paymentMethod: 1,
              totalAmount: 1,
              productTotal: 1,
              addressName: 1,
              addressCountru: 1,
              addressState: 1,
              addressPincode: 1,
              addressPhone: 1,
              adddressEmail: 1,
              products: {
                $arrayElemAt: ["$cartItems", 0],
              },
            },
          },
        ])
        .toArray();
      resolve(singleItems);
    });
  },
  //admin status change
  changeStatus: (details) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          {
            _id: objectID(details.orderId),
            "products.product": objectID(details.proId),
          },
          {
            $set: {
              "products.$.paymentStatus": details.action,
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },

  //admin order cancel
  cancelAdminOrder: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: objectID(orderId), "products.product": objectID(p) },
          {
            $set: {
              status: "order cancelled",
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },
  //admin delivered status
  delivered: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: objectID(orderId) },
          {
            $set: {
              status: "Delivered",
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },
  //admin shipped status
  shipped: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: objectID(orderId) },
          {
            $set: {
              status: "Shipped",
            },
          }
        );
    }).then(() => {
      resolve();
    });
  },

  //razorpay
  generateRazorpay: (orderId, total) => {
    return new Promise((resolve, reject) => {
      var options = {
        amount: total * 100, // amount in the smallest currency unit
        currency: "INR",
        receipt: "" + orderId,
      };
      instance.orders.create(options, function (err, order) {
        if (err) {
          console.log(err);
        } else {
          resolve(order);
        }
      });
    });
  },

  //verify razorpay
  verifyPayment: (details) => {
    return new Promise((resolve, reject) => {
      const crypto = require("crypto");
      let hmac = crypto.createHmac("sha256", "fqXJij2KfofxWAEJ9wpserCl");
      hmac.update(
        details["payment[razorpay_order_id]"] +
          "|" +
          details["payment[razorpay_payment_id]"]
      );
      hmac = hmac.digest("hex");
      if (hmac == details["payment[razorpay_signature]"]) {
        resolve();
      } else {
        reject();
      }
    });
  },

  //change payment status
  changePaymentStatus: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: objectID(orderId) },
          {
            $set: {
              status: "order placed",
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },
  //paypal items taking
  paypalItems: (user, orderId) => {
    return new Promise(async (resolve, reject) => {
      let OrderItems = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              _id: orderId,
            },
          },
          {
            $unwind: "$products",
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "products.product",
              foreignField: "_id",
              as: "orderitem",
            },
          },
          {
            $project: {
              proid: "$products.product",
              orderlist: {
                $arrayElemAt: ["$orderitem", 0],
              },
              quantity: "$products.quantity",
            },
          },
          {
            $project: {
              _id: 0,
              name: "$orderlist.name",
              total: "$orderlist.offerPrice",
              quantity: 1,
            },
          },
          {
            $addFields: {
              price: {
                $toInt: ["$total"],
              },
            },
          },
          {
            $project: {
              name: "$name",
              sku: "item",
              price: {
                $round: [
                  {
                    $multiply: ["$price", 0.012],
                  },
                  0,
                ],
              },
              currency: "USD",
              quantity: "$quantity",
            },
          },
        ])
        .toArray();
      resolve(OrderItems);
    });
  },

  //paypal
  generatePaypal: (items, total) => {
    return new Promise((resolve, reject) => {
      var create_payment_json = {
        intent: "sale",
        payer: {
          payment_method: "paypal",
        },
        redirect_urls: {
          return_url: "http://localhost:3000/verify-paypal",
          cancel_url: "http://localhost:3000/cancel-paypal",
        },
        transactions: [
          {
            item_list: {
              items: items,
            },
            amount: {
              currency: "USD",
              total: total,
            },
            description: "This is the payment description.",
          },
        ],
      };

      paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
          throw error;
        } else {
          console.log("Create Payment Response");
          resolve(payment);
        }
      });
    });
  },
  verifyPaypal: (payerId, paymentId, total) => {
    return new Promise((resolve, reject) => {
      const execute_payment_json = {
        payer_id: payerId,
        transactions: [
          {
            amount: {
              currency: "USD",
              total: total,
            },
          },
        ],
      };

      paypal.payment.execute(
        paymentId,
        execute_payment_json,
        function (error, payment) {
          if (error) {
            console.log(error.response);
            throw error;
          } else {
            console.log(JSON.stringify(payment));
            resolve();
          }
        }
      );
    });
  },
  // wallet purchase
  walletPurchase: (userId, price) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.WALLET_COLLECTION)
        .updateOne(
          { user: objectID(userId) },
          {
            $inc: { Total: parseInt(-price) },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },

  //my account address
  addAccountAddress: (userId, details, addressID) => {
    addressForm = {
      user: objectID(userId),
      details: details,
      addressID: addressID,
    };
    return new Promise((resolve, reject) => {
      details.defaultAddress = false;
      db.get()
        .collection(collection.ADDRESS_COLLECTION)
        .insertOne(addressForm)
        .then(() => {
          resolve();
        });
    });
  },
  //default address
  defaultAddress: (addressId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ADDRESS_COLLECTION)
        .updateOne(
          {
            _id: objectID(addressId),
          },

          {
            $set: {
              "details.defaultAddress": "true",
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },

  //-------------apply coupen in user side -----//
  applyCoupon: (code, total, date) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let checkCoupon = await db
        .get()
        .collection(collection.COUPON_COLLECTION)
        .findOne({ codeGeneraor: code });
      if (checkCoupon) {
        const expireDate = new Date(checkCoupon.date);

        if (expireDate >= date) {
          checkCoupon.dateChecked = true;
          resolve(checkCoupon);
          if (total >= checkCoupon.minAmt) {
            checkCoupon.minChecked = true;
          } else {
            response.minChecked = false;
            response.maxAmountMsg =
              "your maximum purchase should be" + checkCoupon.minAmt;
            resolve(response);
          }
        } else {
          response.dateChecked = false;
          response.dateInvalidMessage = "Date is expired";
          resolve(response);
        }
      } else {
        response.invalidCoupon = true;
        response.invalidMessage = "This coupon code is invalid";
        resolve(response);
      }

      if (checkCoupon && checkCoupon.dateChecked && checkCoupon.minChecked) {
        checkCoupon.couponVerified = true;
        resolve(checkCoupon);
      } else {
        reject("coupon not found");
      }
    });
  },
  //--return in user side
  replaceOrder: (Id) => {
    return new Promise(async (resolve, reject) => {
      orderHistory = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              _id: objectID(Id),
            },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              Amount: 1,
              Mobile: 1,
              payment: 1,
              status: 1,
              product: "$products.product",
              quantity: "$products.quantity",
              orderDate: 1,
              time: 1,
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "product",
              foreignField: "_id",
              as: "cartItems",
            },
          },
          {
            $project: {
              product: 1,
              Amount: 1,
              Mobile: 1,
              payment: 1,
              status: 1,
              orderDate: 1,
              time: 1,
              products: {
                $arrayElemAt: ["$cartItems", 0],
              },
            },
          },
          {
            $sort: {
              time: -1,
            },
          },
        ])
        .toArray();
      resolve(orderHistory);
    });
  },
  //return status changing in user side
  returnStatus: (orderId, proId) => {
    console.log(orderId);
    console.log(proId);
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: objectID(orderId), "products.product": objectID(proId) },
          {
            $set: {
              "products.$.paymentStatus": "Requested Return",
            },
          }
        )
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },

  //refund to get orderid and userid
  orderIduserId: (orderId, proId) => {
    return new Promise(async (resolve, reject) => {
      const orderDetail = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .findOne({
          _id: objectID(orderId),
          "products.product": objectID(proId),
        });
      resolve(orderDetail);
    }).catch(() => {
      reject();
    });
  },

  //refund
  refund: (amount, userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.WALLET_COLLECTION)
        .updateOne(
          { user: objectID(userId) },
          {
            $inc: {
              Total: amount,
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },
  //refund return succes status change
  returnStatusChange: (orderId, proId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: objectID(orderId), "products.product": objectID(proId) },
          {
            $set: {
              "products.$.paymentStatus": "Returned",
            },
          }
        )
        .then((response) => {
          console.log(response);
          resolve();
        });
    });
  },

  //order count
  orderCount: (userId) => {
    return new Promise((resolve, reject) => {
      let count = db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ userId: objectID(userId) })
        .count();
      if (count < 0) {
        reject();
      }
      resolve(count);
    });
  },

  //wallet amount showing in order submit
  walletAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let wallet = db
        .get()
        .collection(collection.WALLET_COLLECTION)
        .findOne({ user: objectID(userId) });
      resolve(wallet);
    });
  },
};
