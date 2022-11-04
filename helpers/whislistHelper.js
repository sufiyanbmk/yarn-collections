var db = require('../config/connection')
var collection = require('../config/collection')
const objectID = require('mongodb').ObjectId

module.exports = {
    addToWhislist: (proId, userId) => {
        objProd = {
            product: objectID(proId),
            quantity: 1,
            time: new Date().getTime()
        }
        return new Promise(async (resolve, reject) => {
            let whislist = await db.get().collection(collection.WHISLIST_COLLECTION).findOne({
                user: objectID(userId)
            })
            if (whislist) {
                let productExist = whislist.products.findIndex(products => products.product == proId)
                if (productExist == -1) {
                    db.get().collection(collection.WHISLIST_COLLECTION).updateOne({
                        user: objectID(userId)
                    },
                        {
                            $push: {
                                products: objProd
                            }
                        }).then(() => {
                            resolve()
                        })
                }
                else {
                    resolve()
                }

            }
            else {
                let whislistObj = {
                    user: objectID(userId),
                    products: [objectID(proId)]
                }
                db.get().collection(collection.WHISLIST_COLLECTION).insertOne(whislistObj).then(() => {
                    resolve()
                })
            }
        })

    },
    //view whislist
    viewWhislist: (userId) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.WHISLIST_COLLECTION).findOne({ user: objectID(userId) })
            if (user) {
                let userwhislist = await db.get().collection(collection.WHISLIST_COLLECTION).aggregate([{
                    $match: {
                        user: objectID(userId)
                    }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        product: '$products.product',
                        count: '$products.quantity',
                        insertionTime: '$products.time'
                    }
                }
                ,
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'product',
                        foreignField: '_id',
                        as: 'whislistItems'
                    }
                },
                    {
                        $sort:{
                            insertionTime: -1
                        }
                    

            }]).toArray()
                console.log(userwhislist);
                resolve(userwhislist)
            }
            else {
                resolve([])
            }
        })
    },
    //delete whislist
    deleteWhislistItem :(userId,prodId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.WHISLIST_COLLECTION).updateOne({
                user : objectID(userId)
            },{
                $pull :{
                    products:{product:objectID(prodId)}
                }
            }).then(()=>{
                resolve()
            })
        })

    }
}
