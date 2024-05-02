const mongoose=require("mongoose")
const passportLocalMongoose=require("passport-local-mongoose") // This module is used for authentication and authorization
// More info about this module ---: https://github.com/saintedlama/passport-local-mongoose
const Schema=mongoose.Schema

const userSchema=new Schema({
    email:{
        type:String,
        required:true
    }
})

userSchema.plugin(passportLocalMongoose) // This will automatically add username and password to schema and some static methods to our schema

module.exports=mongoose.model("User",userSchema)