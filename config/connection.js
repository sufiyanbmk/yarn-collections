const mongoclient = require('mongodb').MongoClient
const state = {
    db:null
}
module.exports.connect = function(done){
    const url = 'mongodb+srv://muhammadsufiyan:yQXnFH3KbpgiXPmU@cluster0.ypqligh.mongodb.net/?retryWrites=true&w=majority'
    const dbname = 'project-ecommerce'

    mongoclient.connect(url,(err,data)=>{
        if(err) return done(err)
        state.db = data.db(dbname)
        done()
    })
}
module.exports.get = function(){
    return state.db
}