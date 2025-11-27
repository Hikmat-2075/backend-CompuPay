import Joi from "joi";

const departmentCreateSchema = Joi.object({
    name: Joi.string().required().messages({
        "string.empty": "Department name is required.",
        "any.required": "Department name is required.",
    }),

    start_salary: Joi.number().integer().required().messages({
        "number.base": "Start salary must be a number.",
        "any.required": "Start salary is required.",
    }),

    end_salary: Joi.number().integer().required().messages({
        "number.base": "End salary must be a number.",
        "any.required": "End salary is required.",
    }),

    description: Joi.string().allow(null, "").optional(),
}).custom((value, helpers) => {
    if (value.start_salary && value.end_salary && value.end_salary < value.start_salary) {
        return helpers.error("any.invalid", "End salary cannot be less than start salary");
    }
    return value;
});


const departmentUpdateSchema = Joi.object({
    name: Joi.string().optional(),
    start_salary: Joi.number().integer().optional(),
    end_salary: Joi.number().integer().optional(),
    description: Joi.string().allow(null, "").optional(),
})
.min(1)  // ⬅️ memastikan minimal ada satu field
.messages({
    "object.min": "At least one field must be provided for update.",
});



export { 
    departmentCreateSchema,
    departmentUpdateSchema, 
};