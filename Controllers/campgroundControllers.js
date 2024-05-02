const mapboxToken=process.env.MAPBOX_TOKEN

// Controllers are used to shift functions of route handlers to this file and then export these functions into route file and use it in route handlers 
const Campground=require("../models/campgrounds")
const {cloudinary}=require("../CloudinaryConfigs")

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding'); // THis is used to include maps in our Website
const geocoding = mbxGeocoding({ accessToken: mapboxToken });
// The Mapbox Geocoding API does two things: forward geocoding and reverse geocoding.
// Forward geocoding converts location text into geographic coordinates,turning 2 Lincoln Memorial Circle NW into -77.050,38.889.(Longitude,Latitude)
// Reverse geocoding turns geographic coordinates into place names, turning -77.050, 38.889 into 2 Lincoln Memorial Circle NW

module.exports.renderIndex=(async(req,res,next)=>{
    const campgrounds=await Campground.find({})
    res.render("index",{campgrounds})
})

module.exports.renderNewForm=(req,res)=>{
    res.render("new")
}

module.exports.renderShowPage=async(req,res,next)=>{
    const {id}=req.params
    const foundCampground = await Campground.findById(id).populate({
        path:"reviews",
        populate:{
            path:"author"
        }
    }).populate('author')
    if (!foundCampground){  // This situation may occur when we copy a url of show campground and then delete it and then search it by pasting that url
        req.flash("error","Oops, No Campground Found")
        res.redirect("/campground")
    }
    res.render(`show`,{foundCampground})
}

module.exports.createNewCampground=async(req,res,next)=>{
    const newData=req.body
    const geoData =await geocoding.forwardGeocode({
        query:req.body.location,
        limit:1
    }).send()
    const newCampground= await new Campground(newData)
    newCampground.geometry=geoData.body.features[0].geometry;
    newCampground.author=req.user._id      // when we login passport.authenticate() method automatically store user details to req.user property
    newCampground.image=req.files.map(f=>({url:f.path,filename:f.filename}))
    await newCampground.save()
    console.log(newCampground)
    req.flash("success","New campground successfully created")
    res.redirect(`/campground/${newCampground._id}`)
}

module.exports.renderEditForm=async(req,res,next)=>{
    const {id}=req.params
    const editCampground=await Campground.findById(id)
    if(!editCampground.author.equals(req.user._id)){
        req.flash("error","You can't edit this campground")
        return res.redirect(`/campground/${id}`)
    }
    res.render("edit",{editCampground})
}

module.exports.editCampground=async(req,res,next)=>{
    const {deleteImages, ...editedCampground}=req.body;
    const {id}=req.params
    const campgroundToEdit=await Campground.findById(id)
    if(!campgroundToEdit.author.equals(req.user._id)){
        req.flash("error","You can't edit this campground")
        return res.redirect(`/campground/${id}`)
    }
    const imgs=req.files.map(f=>({url:f.path,filename:f.filename}))
    const updatedCampground=await Campground.findByIdAndUpdate(id,editedCampground) 
    updatedCampground.image.push(...imgs)
    await updatedCampground.save()
    if(deleteImages){
        for (let filename of deleteImages){
            await cloudinary.uploader.destroy(filename)
        }
        await updatedCampground.updateOne({$pull:{image:{filename:{$in:deleteImages}}}})
    }
    req.flash("success","Campground updated!!")
    res.redirect(`/campground/${id}`)
}

module.exports.deleteCampground=async(req,res,next)=>{
    const {id}=req.params
    const campgroundToDelete=await Campground.findById(id)
    if(!campgroundToDelete.author.equals(req.user._id)){
        req.flash("error","You can't delete this campground")
        return res.redirect(`/campground/${id}`)
    }
    await Campground.findByIdAndDelete(id)
    req.flash("success","Campground Deleted")
    res.redirect("/campground")
}