const express=require("express")
const Router=express.Router()
const passport=require("passport")

const User=require("../models/users")
const userController=require("../Controllers/userController")
const storeReturnTo=require("../Middlewares/returnToUrl")

Router.get("/register",userController.renderRegisterForm)

Router.post("/register",userController.registerNewUser)

Router.get("/login",userController.renderLoginForm)

Router.post("/login",storeReturnTo,passport.authenticate("local",{failureFlash: true,failureRedirect:"/login"}) ,userController.loginUser)

Router.get("/logout",userController.logoutUser)


module.exports =Router