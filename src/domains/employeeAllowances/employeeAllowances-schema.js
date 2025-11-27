import Joi from "joi";

const employeeAllowancesCreateSchema = Joi.object({
    employeeId: Joi.string().uuid().required().messages({
        "any.required": "Employee ID is required.",
        "string.guid": "Employee ID must be a valid UUID."
    }),

    allowanceId: Joi.string().uuid().required().messages({
        "any.required": "Allowance ID is required.",
        "string.guid": "Allowance ID must be a valid UUID."
    }),

    type: Joi.string().trim().required().messages({
        "any.required": "Type is required."
    }),

    amount: Joi.number().integer().positive().required().messages({
        "any.required": "Amount is required.",
        "number.base": "Amount must be a number.",
        "number.positive": "Amount must be greater than 0."
    }),

    effective_date: Joi.date().required().messages({
        "any.required": "Effective date is required.",
        "date.base": "Effective date must be a valid date."
    })
});



const employeeAllowancesUpdateSchema = Joi.object({
    allowanceId: Joi.string().uuid().messages({
        "string.guid": "Allowance ID must be a valid UUID."
    }),

    type: Joi.string().trim(),

    amount: Joi.number().integer().positive().messages({
        "number.base": "Amount must be a number.",
        "number.positive": "Amount must be greater than 0."
    }),

    effective_date: Joi.date().messages({
        "date.base": "Effective date must be a valid date."
    })
})
.min(1)
.messages({
    "object.min": "At least one field must be updated."
});



export { employeeAllowancesCreateSchema, employeeAllowancesUpdateSchema };