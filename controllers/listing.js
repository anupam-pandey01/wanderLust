const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError.js");

module.exports.index = async (req, res)=>{
    let allListings = await Listing.find({});
    res.render("./listings/index.ejs", {allListings});
};


module.exports.renderNewForm = (req, res)=>{
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews",
        populate: {
            path: "author",
        }
    })
    .populate("owner");
    if(!listing){
        req.flash("error", "Listing you requested does not exist");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", {listing});
};

module.exports.createListing = async (req, res, next)=>{
    const address = req.body.listing.location;
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`);
    const data = await response.json();
    let geometry;

    if (data.length > 0) {
        const lat = data[0].lat;
        const lon = data[0].lon;
        
    // GeoJSON format
         geometry = {
            type: "Point",
            coordinates: [lon, lat], // GeoJSON requires [longitude, latitude]
        };
    } else {
        throw  new ExpressError(404, "Address not found");
    }

    let url = req.file.path;
    let filename = req.file.filename;
    let newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    newListing.geometry = geometry;
    let savedListing = await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res)=>{
    let{id} = req.params;
    const listing = await Listing.findById(id);
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_300");
    res.render("listings/edit.ejs", {listing, originalImageUrl});
};

module.exports.updateListing = async (req, res)=>{
    if(!req.body.listing){
        throw  new ExpressError(404, "Send valid data for listing");
      }
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
    
    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename};
        await listing.save();
    }

    req.flash("success", "Listing Updated!"); 
    res.redirect(`/listings/${id}`);   
};


module.exports.deleteListing = async (req, res)=>{
    let{id} = req.params;
    let listing =  await Listing.findByIdAndDelete(id);
    console.log(listing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}
