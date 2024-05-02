const User=require("../models/users")

module.exports.renderRegisterForm=(req,res,next)=>{
    res.render("register")
}

module.exports.registerNewUser=async(req,res,next)=>{
    try{ 
        const {username,email,password}=req.body
        const user= new User({username,email})   // Creating user instance here 
        const registeredUser=await User.register(user,password)            // This is a static method added by passport-local-mongoose which take user details,password  
        // It Store all user detail which include Username,email,Hashed password,salt used automatically and we dont even need to save model
        req.login(registeredUser,err=>{
            if(err){
                return next(err)
            }
            req.flash("success","Welcome to Yelp-Camp")
            res.redirect("/campground")
        })
    }catch(e){
        req.flash("error",e)
        res.redirect("/register")
    }
}

module.exports.renderLoginForm=(req,res,next)=>{
    res.render("login")
}

module.exports.loginUser=(req,res,next)=>{
    // passport.authenticate() is middleware which will authenticate(checks username,password is correct or not) the request. By default, when authentication 
    // succeeds, the req.user property is set to the authenticated user, a login session is established, and the next function in the stack is called.
    const resRedirectUrl=res.locals.returnTo || "/campground"
    req.flash("success","Welcome back")
    res.redirect(resRedirectUrl)
}

module.exports.logoutUser=(req,res)=>{
    req.logout((e)=>{
        if(e){
            return next(e)
        }
        req.flash("success","GoodBye!! You are logged out")
        res.redirect("/campground")
    })
}