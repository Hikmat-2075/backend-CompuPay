import Joi from "joi";

const typeEnum = ["MONTHLY", "SEMI_MONTHLY", "ONCE"]; // sesuai Prisma

const employeeAllowancesCreateSchema = Joi.object({
    user_id: Joi.string().uuid().required().messages({
        "any.required": "Employee ID is required.",
        "string.guid": "Employee ID must be a valid UUID."
    }),

    allowance_id: Joi.string().uuid().required().messages({
        "any.required": "Allowance ID is required.",
        "string.guid": "Allowance ID must be a valid UUID."
    }),

    type: Joi.string().valid(...typeEnum).required().messages({
        "any.required": "Type is required.",
        "any.only": `Type must be one of: ${typeEnum.join(", ")}`
    }),

    amount: Joi.number().integer().positive().required().messages({
        "any.required": "Amount is required.",
        "number.base": "Amount must be a number.",
        "number.positive": "Amount must be greater than 0."
    }),

    effective_date: Joi.date().iso().required().messages({
        "any.required": "Effective date is required.",
        "date.base": "Effective date must be a valid ISO date."
    }),
});




const employeeAllowancesUpdateSchema = Joi.object({
    user_id: Joi.string().uuid().messages({
        "string.guid": "Employee ID must be a valid UUID."
    }),
    allowance_id: Joi.string().uuid().messages({
        "string.guid": "Allowance ID must be a valid UUID."
    }),

    type: Joi.string().valid(...typeEnum).messages({
        "any.only": `Type must be one of: ${typeEnum.join(", ")}`
    }),

    amount: Joi.number().integer().positive().messages({
        "number.base": "Amount must be a number.",
        "number.positive": "Amount must be greater than 0."
    }),

    effective_date: Joi.date().iso().messages({
        "date.base": "Effective date must be a valid ISO date."
    })
    })
    .min(1)
    .messages({
    "object.min": "At least one field must be updated."
});




export { employeeAllowancesCreateSchema, employeeAllowancesUpdateSchema };