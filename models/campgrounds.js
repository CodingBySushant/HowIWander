const express=require("express")
const app=express()
const mongoose=require("mongoose")
const Schema=mongoose.Schema
const Review=require("./review")

const opts={toJSON:{virtuals:true}}

const campgroundSchema=new Schema({
    title:String,
    price:Number,
    image:[{
        url:String,
        filename:String
    }],
    geometry:{
        type:{
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'geometry.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    description:String,
    location:String,
    author:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    reviews:[{
        type:Schema.Types.ObjectId,
        ref:'Review'
    }]
},opts)

campgroundSchema.virtual('properties.popUpHtml').get(function(){
    return `<strong><a href='/campground/${this._id}'>${this.title}</a><strong>`
})

campgroundSchema.post("findOneAndDelete",async(doc)=>{  // This is a post hook to findOneAndDelete method so that when we delete a campground
    // review related to that campground also gets deleted  
    if(doc){
        await Review.deleteMany({
            _id:{
                $in:doc.reviews
            } 
        })
    }

})

module.exports= mongoose.model("Campground",campgroundSchema)