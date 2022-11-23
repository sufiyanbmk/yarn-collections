var db = require("../config/connection");
var collection = require("../config/collection");
const objectId = require("mongodb").ObjectId;

module.exports = {
  addToWhislist: (proId, userId) => {
    objProd = {
      user: objectId(userId),
      product: [objectId(proId)],
    };
    return new Promise(async (resolve, reject) => {
      let whislist = await db
        .get()
        .collection(collection.WHISLIST_COLLECTION)
        .findOne({
          user: objectId(userId),
        });
      if (whislist) {
        let productExist = whislist.product.findIndex(
          (product) => product.product == proId
        );
        if (productExist == -1) {
          db.get()
            .collection(collection.WHISLIST_COLLECTION)
            .updateOne(
              {
                user: objectId(userId),
              },
              {
                $push: {
                  product: objectId(proId),
                },
              }
            )
            .then(() => {
              resolve();
            });
        } else {
          resolve();
        }
      } else {
        // let whislistObj = {
        //   user: objectId(userId),
        //   products: [objectId(proId)],
        //   time: new Date().getTime(),
        // };
        db.get()
          .collection(collection.WHISLIST_COLLECTION)
          .insertOne(objProd)
          .then(() => {
            resolve();
          });
      }
    });
  },
  //view whislist
  viewWhislist: (userId) => {
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collection.WHISLIST_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (user) {
        let userwhislist = await db
          .get()
          .collection(collection.WHISLIST_COLLECTION)
          .aggregate([
            {
              $match: {
                user: objectId(userId),
              },
            },
            {
              $unwind: "$product",
            },

            {
              $lookup: {
                from: collection.PRODUCT_COLLECTION,
                localField: "product",
                foreignField: "_id",
                as: "whislistItems",
              },
            },
            // {
            //   $sort: {
            //     insertionTime: -1,
            //   },
            // },
          ])
          .toArray();
        resolve(userwhislist);
      } else {
        resolve([]);
      }
    });
  },
  //delete whislist
  deleteWhislistItem: (userId, prodId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.WHISLIST_COLLECTION)
        .updateOne(
          {
            user: objectId(userId),
          },
          {
            $pull: {
              product: objectId(prodId),
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },
  //user side liked whislist
  getuserWhislist: (userId) => {
    return new Promise(async (resolve, reject) => {
      let whislistItem = await db
        .get()
        .collection(collection.WHISLIST_COLLECTION)
        .find({ user: objectId(userId) })
        .toArray();
      resolve(whislistItem);
    });
  },
};
