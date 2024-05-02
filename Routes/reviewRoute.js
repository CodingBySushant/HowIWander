const express=require("express")
const app=express()
const Router=express.Router({mergeParams:true})
const Joi =require("joi")

const appError=require('../Utils/appError')
const wrapAsync=require('../Utils/wrapAsync')

const Review=require("../models/review")
const Campground=require("../models/campgrounds")
const isLoggedIn=require("../Middlewares/isLoggedIn")
const validateReviews=require("../Middlewares/validateReviews")

const reviewController=require("../Controllers/reviewController")


Router.post("/",isLoggedIn,validateReviews,wrapAsync(reviewController.createNewReview))

Router.delete("/:reviewId",isLoggedIn,wrapAsync(reviewController.deleteReview))

module.exports=Router