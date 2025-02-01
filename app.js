if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const Listing = require("./models/listing");
const listingRouter = require("./routes/listings.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const wrapAsync = require('./utils/wrapAsync.js');



// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

const dbUrl = process.env.ATLASDB_URL;
main()
.then(()=>{
    console.log("connected to DB");
})
.catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);



const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret:process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", ()=>{
    console.log("Error in MongoDb", err)
})

const sessionOption = {
    store,
    secret:process.env.SECRET, 
    resave: false, 
    saveUninitialized: true,
    cookie:{
        experies: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge:  7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};



app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next)=>{
        res.locals.success = req.flash("success");
        res.locals.error = req.flash("error");
        res.locals.currUser = req.user;
        next();
});

app.use(async (req, res, next)=>{
    let allListings = await Listing.find({});
    res.locals.allFilters = allListings;
    next();
})

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);


app.get("/filter",wrapAsync(async (req, res, next)=>{
    let {location : newLocation} = req.query;
    let filterListing = await Listing.find({location: { $regex: new RegExp(newLocation, "i") }});
    if(filterListing){
        res.render("./listings/filter.ejs", {filterListing});
    }
}));

app.get("/tab", async(req, res, next)=>{
    let tag = req.query.value;
    let tagListing = await Listing.find({category: tag});
    res.render("./listings/tab.ejs", {tagListing});
});

app.all("*", (req, res, next)=>{
    next(new ExpressError(404, "Page not found!"));
});

app.use((err, req, res, next)=>{
  let {statusCode=500, message="Something not found!"} = err;
  res.status(statusCode).render("error/error.ejs", {message});
});

app.listen(8080, ()=>{
    console.log("Server is listening to port 8080");
})