import Joi from "joi";

const departmentCreateSchema = Joi.object({
    name: Joi.string().required().messages({
        "string.empty": "name is required.",
    }),
});

const departmentUpdateSchema = Joi.object({
    name : Joi.string().optional().messages({
        "string.empty": "Department is required.",
    })
    .min(1)
    .messages({
        "object.min": "At least one field must be provided for update.",
    }),
});


export { 
    departmentCreateSchema,
    departmentUpdateSchema, 
};