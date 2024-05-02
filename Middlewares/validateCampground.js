const BaseJoi =require("joi")
const appError=require('../Utils/appError')

const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)

const validateCampground=(req,res,next)=>{           // This is a middleware created to validate input data 
    const validationCampgroundSchema=Joi.object({    // In this we used "joi" module which help us to validate input data 
        title:Joi.string().required().escapeHTML(),               // We just need to define a Schema and then use "Schema.validate(data)" to validate data
        location:Joi.string().required().escapeHTML(),
        // image:Joi.string().required(),
        price:Joi.number().required().min(0),
        description:Joi.string().required().escapeHTML(),
        deleteImages:Joi.array()
    }).required()
    const {error} =validationCampgroundSchema.validate(req.body)
    if(error){
        const msg =error.details.map(el=>el.message).join(',')
        throw new appError(msg,400)
    }else{
        next()   // This next is used if we didn't have any error then move next to our route handler.
                 // In middlewares we need to use this next() function always
    }
}

module.exports=validateCampground