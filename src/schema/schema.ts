import Joi from "joi";




const userSchema = Joi.object({
    
    email: Joi.string().email().required(),
    name: Joi.string(),
    isAdmin: Joi.boolean().required()
   
    
});




export {
    
    
    userSchema
    
};
