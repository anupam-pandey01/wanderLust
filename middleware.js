const Listing = require("./models/listing");
const Review = require("./models/review.js");
const {listingSchema} = require("./Schema.js");
const ExpressError = require("./utils/ExpressError.js");
const {reviewSchema} = require("./Schema.js");

// This is a middleware which check that the user is login or not
//  Before perform CRUD operation the listings.
module.exports.isLoggedIn = (req, res, next)=>{
    if(!req.isAuthenticated()){
        req.session.redirect = req.originalUrl;
        req.flash("error", "You must be login to create listings");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) =>{
    if(req.session.redirect){
        res.locals.redirectUrl = req.session.redirect; 
    }
    next();
}


module.exports.isOwner = async (req, res, next)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error", "You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next)=>{
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author._id.equals(res.locals.currUser._id)){
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
}


// Listing validation for server side
module.exports.validateListing = (req, res, next)=>{
    let {error}  = listingSchema.validate(req.body);
    //    let errMsg = error.details.map((el)=>el.message).join(",");
       if(error){
            throw new ExpressError(400, error);
       }else{
        next();
    }
}

// Review Validation for server side
module.exports.validateReview = (req, res, next)=>{
    let {error}  = reviewSchema.validate(req.body);
    //    let errMsg = error.details.map((el)=>el.message).join(",");
       if(error){
            throw new ExpressError(400, error);
       }else{
        next();
    }
}