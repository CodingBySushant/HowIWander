const express=require("express")
const Router=express.Router()
const {storage}=require("../CloudinaryConfigs")

const multer=require("multer")
// Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files
// Multer adds a body object and a file or files object to the request object. 
// The body object contains the values of the text fields of the form, the file or files object contains the files uploaded via the form.
// More info about multer --: https://github.com/expressjs/multer

const upload=multer({storage}) // This is the syntax to provide destination location were we want to save uploaded files

const Campground=require("../models/campgrounds")

const campgroundControllers=require("../Controllers/campgroundControllers")

const wrapAsync=require('../Utils/wrapAsync')
const isLoggedIn=require("../Middlewares/isLoggedIn")
const validateCampground=require("../Middlewares/validateCampground")




Router.get("/",wrapAsync(campgroundControllers.renderIndex))

Router.get("/new",isLoggedIn,campgroundControllers.renderNewForm)

Router.get("/:id",wrapAsync(campgroundControllers.renderShowPage))

Router.post("/",isLoggedIn,upload.array("image"),validateCampground,wrapAsync(campgroundControllers.createNewCampground))
// There are two methods to retrieve data of input file and save it on our defined location
// 1. Upload.single("name") this method is used to save the file recieved on destination we defined earlier 
// This method also make two properties of req object req.body and req.file. 
// req.body contains all other text information and req.file contain info about the file
// Given below data is stored in req.file property
// fieldname ---- Field name  specified in the form	
// originalname	----- Name of the file on the user's computer	
// encoding	----- Encoding type of the file	
// mimetype	----- Mime type of the file	
// size	------- Size of the file in bytes	
// destination	------ The folder to which the file has been saved	
// filename	------- The name of the file within the destination	
// path ------ 	The full path to the uploaded file	
// buffer	-------- A Buffer of the entire file	

// 2. Upload.array("name") -- It is similar to upper method difference is just that it upload array of images
// For this we need to set input tag in html to multiple


Router.get("/:id/edit",isLoggedIn,wrapAsync(campgroundControllers.renderEditForm))

Router.put("/:id",isLoggedIn,upload.array("image"),validateCampground,wrapAsync(campgroundControllers.editCampground))

Router.delete("/:id",isLoggedIn,wrapAsync(campgroundControllers.deleteCampground))

module.exports= Router