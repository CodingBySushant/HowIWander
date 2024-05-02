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

const validateReviews=(req,res,next)=>{
    const validationReviewSchema=Joi.object({
        body:Joi.string().required().escapeHTML(),
        rating:Joi.number().required()
    }).required()
    const {error}=validationReviewSchema.validate(req.body)
    if (error){
        const msg =error.details.map(el=>el.message).join(',')
        throw new appError(msg,400)
    }else{
        next()
    }
}

module.exports=validateReviews