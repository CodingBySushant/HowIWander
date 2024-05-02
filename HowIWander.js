// Generally we dont save our API keys or API secret in our database nor we define them in our main file directly
// So we use .env files to store that info and we dont share that info with anyone 
// To retrieve that data from .env file we use another module/package called "dotenv"
if(process.env.NODE_ENV!=="production"){  
    require("dotenv").config()      // Using .config() method it will store all data to process.env object and we can access that easily
}


const express=require("express")
const app=express()
const methodOverride=require("method-override")
const path=require("path")
const mongoose=require("mongoose")
const ejsMate=require("ejs-mate")  // This is a npm module which help to make a layout file and use in every other file to prevent repetition
// const Joi =require("joi") //This is used for server side validations
const session=require("express-session")
const flash=require("connect-flash")
const passport=require("passport")
const Localpassport=require("passport-local")
const helmet=require("helmet")

// There are lot of security issues with all websites which a dev need to deal with 
// Some of them we have discussed in short in our app 


// 1. Mongodb-Injection -: 
// In Mongodb-Injection user deliberately pass on mongo operators which inlcude $ sign or '.' like "$gt:" " " to get data stored in our database
const mongoSanitize = require('express-mongo-sanitize'); // This module is to prevent basic mongo-injection kind of hack 
// Link for this module --: https://www.npmjs.com/package/express-mongo-sanitize

// 2. Cross site scripting -:
// In this hacker might pass his script through query or req.params  
// That script may include a code to get user cookies from that site and save it to hackers server
// To overcome this either we can use express-validator module instead of JOI for validations 
// or we can define our own JOI extension using 'sanitize-html' module to escape Html from req.body 
// Link for 'sanitize-html' module -- https://www.npmjs.com/package/sanitize-html
// Check validateCampground and validateReviews for this

// For more security protection we gonna use 'helmet' module which protects from different type of attacks on its own
// Link for helmet module -- https://helmetjs.github.io/

const campgroundRouter=require("./Routes/campgroundRoute")
const reviewRouter=require("./Routes/reviewRoute")
const userRouter=require("./Routes/userRoute")

const appError=require('./Utils/appError')  // This is to throw error with custom message and status code
// const wrapAsync=require('./Utils/wrapAsync') // This is used inplace of try and catch inside async functions

// const Review=require("./models/review")
// const Campground=require("./models/campgrounds")
const User=require("./models/users")

mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp",{
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useUnifiedTopology: true
})

const db=mongoose.connection
db.on("error",console.error.bind(console,"connection error"))
db.once("open",()=>{
    console.log("Database Connected")
})

app.engine('ejs',ejsMate) // This is a npm module which help to make a layout file and use in every other file to prevent repetition
app.use(methodOverride("_method"))
app.set("view engine","ejs")
app.set("views",path.join(__dirname,"templates"))
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,"staticFiles")))

app.use(mongoSanitize())

app.use(helmet({contentSecurityPolicy: false}))



const sessionConfig={
    secret:"topSecret",
    name:"session",
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        // secure:true,   // This property keeps a check that our site is accessed through https request only than only it starts a session
        // Our localhost request is not https request so commented right now but do uncomment after deploying this site
        expires:Date.now() + 1000*60*60*24*7,     // Date.now() provides you data in milliseconds, so we need to add time in milliseconds only
        maxAge:1000*60*60*24*7                    // Time defined here is millisecond/sec * sec/min * min/hr * hr/day * day/week
    }
}


app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())    // Our normal session should be used before passport.session()
passport.use(new Localpassport(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


app.use((req,res,next)=>{
    res.locals.currentUser=req.user   // Passport make req.user and fill user data in that for a particular session
    // By default, when authentication succeeds, the req.user property is set to the authenticated user
    res.locals.success=req.flash("success")
    res.locals.error=req.flash("error")
    next()
})

app.get("/",(req,res)=>{
    res.render('home')
})
app.use("/campground",campgroundRouter)
app.use("/campground/:id/review",reviewRouter)
app.use("/",userRouter)




// In this we need some error handlers to handle errors whether its from client or our server
// 1. Client-Side form validation -: This will ensure that if we require any input from user, user gives that
// For this we can just "require" our input elements in html and browser will provide its own message 
// But for now we are using bootstrap for doing this, check this link for that - https://getbootstrap.com/docs/5.3/forms/validation/

// 2. MongoDb errors -: This include a. Schema validation errors (which may include entering string in price input)

// const validateCampground=(req,res,next)=>{           // This is a middleware created to validate input data 
//     const validationCampgroundSchema=Joi.object({    // In this we used "joi" module which help us to validate input data 
//         title:Joi.string().required(),               // We just need to define a Schema and then use "Schema.validate(data)" to validate data
//         location:Joi.string().required(),
//         image:Joi.string().required(),
//         price:Joi.number().required().min(0),
//         description:Joi.string().required()
//     }).required()
//     const {error} =validationCampgroundSchema.validate(req.body)
//     if(error){
//         const msg =error.details.map(el=>el.message).join(',')
//         throw new appError(msg,400)
//     }else{
//         next()   // This next is used if we didn't have any error then move next to our route handler.
//                  // In middlewares we need to use this next() function always
//     }
// }

// const validateReviews=(req,res,next)=>{
//     const validationReviewSchema=Joi.object({
//         body:Joi.string().required(),
//         rating:Joi.number().required()
//     }).required()
//     const {error}=validationReviewSchema.validate(req.body)
//     if (error){
//         const msg =error.details.map(el=>el.message).join(',')
//         throw new appError(msg,400)
//     }else{
//         next()
//     }
// }



// app.get("/campground",wrapAsync(async(req,res,next)=>{
//     const campgrounds=await Campground.find({})
//     res.render("index",{campgrounds})
// }))

// app.get("/campground/new",(req,res)=>{
//     res.render("new")
// })

// app.get("/campground/:id",wrapAsync(async(req,res,next)=>{
//     const {id}=req.params
//     const foundCampground = await Campground.findById(id).populate('reviews')
//     res.render(`show`,{foundCampground})
// }))

// app.post("/campground",validateCampground,wrapAsync(async(req,res,next)=>{
//     const newData=req.body
//     const newCampground= await new Campground(newData)
//     await newCampground.save()
//     res.redirect(`/campground/${newCampground._id}`)
// }))

// app.get("/campground/:id/edit",wrapAsync(async(req,res,next)=>{
//     const {id}=req.params
//     const editCampground=await Campground.findById(id)
//     res.render("edit",{editCampground})
// }))

// app.put("/campground/:id",validateCampground,wrapAsync(async(req,res,next)=>{
//     const editedCampground=req.body
//     const {id}=req.params
//     await Campground.findByIdAndUpdate(id,editedCampground)
//     res.redirect(`/campground/${id}`)
// }))

// app.delete("/campground/:id",wrapAsync(async(req,res,next)=>{
//     const {id}=req.params
//     await Campground.findByIdAndDelete(id)
//     res.redirect("/campground")
// }))

// app.delete("/campground/:id/review/:reviewId",wrapAsync(async(req,res,next)=>{
//     const {id,reviewId}=req.params
//     await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}})
//     await Review.findByIdAndDelete(reviewId)
//     res.redirect(`/campground/${id}`)
// }))

// app.post("/campground/:id/review",validateReviews,wrapAsync(async(req,res,next)=>{
//     const {id}=req.params
//     const review=await new Review(req.body)
//     const campground=await Campground.findById(id)
//     // console.log(campground)
//     campground.reviews.push(review)
//     await campground.save()
//     await review.save()
//     res.redirect(`/campground/${id}`)
// }))



app.all("*",(req,res,next)=>{ 
    next(new appError("No page found on this URL",400))
})

app.use((err,req,res,next)=>{
    const {status=500,message="Something went Wrong"}=err;
    if (!err.status) err.status=500
    res.render("error",{err})
})


app.listen(3000,()=>{
    console.log("Website ready for requests")
})