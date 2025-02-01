const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

// making schema
const listingSchema =new Schema({
    title:{
        type: String,
        required: true,
    },
    description: String,
    image: {
       url: String,
       filename: String,
    },
    price: Number,
    location: String,
    country: String,
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review",
        }
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    geometry:{
        type: {
            type: String,
            enum: ["Point"], // GeoJSON type must be "Point"
        },
        coordinates: {
            type: [Number], // Array of numbers: [longitude, latitude]
            required: true,
        },
    },
    category:{
        type: [ String ],
        enum: {
            values: ["Trending", "Room", "Castles", "Iconic Cities", "Amazing Pools", "Camping", "Farms", "Arctic", "Domes", "Winter Cities"],
            message: "{VALUE} is not a valid category",
        },
        default: ["Room"],
    }
});

listingSchema.post("findOneAndDelete", async (listing)=>{
    if(listing){
        await Review.deleteMany({_id: {$in: listing.reviews}});
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;