const Review=require("../models/review")
const Campground=require("../models/campgrounds")

module.exports.createNewReview=async(req,res,next)=>{
    const {id}=req.params
    const review=await new Review(req.body)
    const campground=await Campground.findById(id)
    review.author=req.user._id
    // console.log(campground)
    campground.reviews.push(review)
    await campground.save()
    await review.save()
    req.flash("success","New review created")
    res.redirect(`/campground/${id}`)
}

module.exports.deleteReview=async(req,res,next)=>{
    const {id,reviewId}=req.params
    const reviewToDelete=await Review.findById(reviewId)
    if(!reviewToDelete.author.equals(req.user._id)){
        req.flash("error","You can't delete this review")
        return res.redirect(`/campground/${id}`)
    }
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}})
    await Review.findByIdAndDelete(reviewId)
    req.flash("success","Review deleted")
    res.redirect(`/campground/${id}`)
}