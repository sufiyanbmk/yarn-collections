var db = require('../config/connection')
var collection = require('../config/collection')
const objectID = require('mongodb').ObjectId


module.exports = {
    addCart: (proId, userId) => {

        objProd = {
            product: objectID(proId),
            quantity: 1,
            time: new Date().getTime()
        }

        return new Promise(async (resolve, reject) => {

            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectID(userId) })

            if (userCart) {

                let productExist = userCart.products.findIndex(products => products.product == proId)
                if (productExist == -1) {
                    db.get().collection(collection.CART_COLLECTION).updateOne({
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
                    resolve();
                }
            }
            else {


                let cartObj = {
                    user: objectID(userId),
                    products: [objProd],
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then(() => {
                    resolve()
                })
            }
        })

    },

    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectID(userId) })
            if (user) {
                let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                    {
                        $match: { user: objectID(userId) }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            product: '$products.product',
                            quantity: '$products.quantity',
                            inertionTime: '$products.time'
                        }
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: 'product',
                            foreignField: '_id',
                            as: 'cartItems'
                        }
                    },
                    {
                        $project: {
                            inertionTime: 1, quantity: 1, product: { $arrayElemAt: ['$cartItems', 0] }
                        }
                    },
                    {
                        $addFields:{
                            price:{
                                $toInt:['$product.offerPrice']
                            }
                        }
                    },
                    {
                        $project:{
                            quantity:1,insertionTime:1,product:1,
                            total:{
                                $sum:{
                                    $multiply:['$quantity','$price']
                                }
                            }
                        }
                    },
                    {
                        $sort: {
                            insertionTime: -1
                        }
                    }

                ]).toArray()
                console.log(cartItems)
                resolve(cartItems)
            }
            else {
                resolve([])
            }

        })
    },
    // increament and decrement of product 
    changeQuantity: (details) => {
        details.quantity = parseInt(details.quantity)
        details.count = parseInt(details.count)
        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {
             
                db.get().collection(collection.CART_COLLECTION).updateOne({
                    user: objectID(details.user)
                }, {
                    $pull: {
                        products: { product: objectID(details.product) }
                    }
                }).then(() => {
                    resolve({ removeProduct: true })
                })
            }
            else {

                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: objectID(details.cart), 'products.product': objectID(details.product) },
                        {
                            $inc: { 'products.$.quantity': details.count }
                        }
                    ).then((response) => {
                        resolve(response)
                    })
            }
        })

    },

    // delete cartitems
    deleteCartItem: (userId, prodId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).updateOne({
                user: objectID(userId)
            }, {
                $pull: {
                    products: { product: objectID(prodId) }
                }
            }).then(() => {
                resolve()
            })
        })
    },
    //total amout of cart
    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectID(userId) })
            if (user) {

                let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                    {
                        $match: { user: objectID(userId) }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            product: '$products.product',
                            quantity: '$products.quantity',
                            inertionTime: '$products.time'
                        }
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: 'product',
                            foreignField: '_id',
                            as: 'cartItems'
                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, product: { $arrayElemAt: ['$cartItems', 0] }
                        }
                    },
                    {
                        $addFields:{
                            price:{$toInt:['$product.offerPrice']}
                        }
                    },
                    {
                        $group:{
                            _id:null,
                            total:{$sum:{$multiply:['$quantity','$price']}}

                        }
                    }


                ]).toArray()
                resolve(total[0].total) 
            }
            else {
                resolve()
            }

        })
    }    
}    
