var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt')
const { response } = require('../app')
// const { ObjectID } = require('bson')
const objectID = require('mongodb').ObjectId

const referalcode =require('referral-codes')

module.exports = {
    dosignup: (userData)=>{
        
        return new Promise(async (resolve, reject) => {
            userData.password = await bcrypt.hash(userData.password, 10)
            db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email }).then(async (response) => {

                if (response) {
                    resolve(response)
                }
                else {
                        userData.banned = false
                        userData.Address = [];
                        if (userData.referralCode) {
                          let referaluser = await db.get().collection(collection.USER_COLLECTION).findOne({ referralCode: userData.referralCode })
                          if (referaluser) {
                            userData.referralCode = referalcode.generate({
                              prefix: userData.name
                            })[0].replaceAll(" ", "");
                            db.get()
                              .collection(collection.USER_COLLECTION)
                              .insertOne(userData)
                              .then((data) => {
                                console.log(data);
                                wallet = {
                                  user: data.insertedId,
                                  Total: 0,
                                  History: [{ RefferdFrom: referaluser._id, user: referaluser.name, credited: 10, Time: new Date() }]
                                }
                                db.get().collection(collection.WALLET_COLLECTION).insertOne(wallet)
                                db.get().collection(collection.WALLET_COLLECTION).updateOne({ user: referaluser._id }, { $inc: { Total: 10 }, $push: { History: { RefferdTo: data.insertedId, name: userData.name, credited: 10, Time: new Date() } } })
                                resolve(data);
                              });
                          } else {
                            reject()
                          }
                        } else {
                          userData.referralCode = referalcode.generate({
                            prefix: userData.name
                          })[0].replaceAll(" ", "");
                          db.get()
                            .collection(collection.USER_COLLECTION)
                            .insertOne(userData)
                            .then((data) => {
                              console.log(data);
                              wallet = {
                                user: data.insertedId,
                                Total: 0,
                                History: []
                              }
                              db.get().collection(collection.WALLET_COLLECTION).insertOne(wallet)
                              resolve(data);
                            });
                        }
                    
                }
            })
        })
    },
    dologin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let loginstatus = false;
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
            if(user){
               if(user.banned == false)
                {
                   
                    bcrypt.compare(userData.password,user.password).then((status)=>{
                        if(status){
                           response.user = user
                            response.status = true
                            resolve(response)
                        }
                        else{
                            console.log('login failed')
                            resolve({status:false})
                        }
                    })
                }
                else{
                    console.log('banned failed')
                    resolve({status:false})
                }
            }else{
                console.log('login failed')
                resolve({status:false})
            }
        })
    },

    otp:(userNum)=>{
        let response = {}
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).findOne({phoneNo:userNum}).then((response)=>{
                if(response){
                    response.status=true
                    response.user=response
                    console.log(response);
                    resolve(response)
                }
                else{
                    console.log('failed')
                    resolve(response)
                }
            })
        })
    },

    //women catagory  product
    getCatagoryProducts :(catagory)=>{
        return new Promise(async(resolve,reject)=>{
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).find({Category:catagory}).toArray()
       
            resolve(product)
        })
    },
    //user profile
    userProfile :(userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).findOne({_id:objectID(userId)}).then((response)=>{
                resolve(response)
            })
        })
    },   
    //edit profile
    editProfile : (userId,user)=>{
        
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectID(userId)},{
                $set:{
                    name: user.name,
                    email: user.email,
                    phoneNo:user.phone
                }
            }).then((response)=>{
                console.log(response)
                resolve(response)
            })
        })
    },
    //password change
    passwordChange : (userId,userpsw)=>{
        return new Promise(async(resolve,reject)=>{
            let user =await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectID(userId)})
            if(user){
             
                bcrypt.compare(userpsw.password,user.password).then(async(status)=>{
                    if(status){
                        userpsw.npassword = await bcrypt.hash(userpsw.npassword, 10)
                        db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectID(userId)},{
                            $set:{
                                password:userpsw.npassword
                            }
                        }).then((response)=>{
                            console.log(response)
                            resolve(response)
                        })
                    }
                    else{
                    
                        resolve({status:false})
                    }
                })
            }
        })
    },
    
    //--------wallet showing in user side ------//
    getWallet : (userId)=>{
        return new Promise((resolve,reject)=>{
            let walletDetails = db.get().collection(collection.WALLET_COLLECTION).findOne({user:objectID(userId)})
            resolve(walletDetails) 
        })

    }

    //--------user replace product----//
    

}        