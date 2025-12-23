import Joi from "joi";

const employeeDeductionsCreateSchema = Joi.object({
    user_id: Joi.string().uuid().required().messages({
        "string.empty": "Employee ID is required.",
        "string.guid": "Employee ID must be a valid UUID.",
    }),
    deduction_id: Joi.string().uuid().required().messages({
        "string.empty": "Deduction ID is required.",
        "string.guid": "Deduction ID must be a valid UUID.",
    }),
    type: Joi.string()
        .valid("MONTHLY", "SEMI_MONTHLY", "ONCE")
        .required()
        .messages({
            "any.only": "Type must be one of: MONTHLY, SEMI_MONTHLY, ONCE.",
            "string.empty": "Type is required."
        }),
    amount: Joi.number().integer().min(0).required().messages({
        "number.base": "Amount must be a number.",
        "number.min": "Amount cannot be less than 0.",
        "any.required": "Amount is required."
    }),
    effective_date: Joi.date().iso().required().messages({
        "date.base": "Effective date must be a valid date.",
        "date.format": "Effective date must be in ISO format.",
        "any.required": "Effective date is required."
    })
});

const employeeDeductionsUpdateSchema = Joi.object({
    type: Joi.string().valid("MONTHLY", "SEMI_MONTHLY", "ONCE").allow(""),
    amount: Joi.number().integer().min(0).allow(""),
    effective_date: Joi.date().iso().allow("")
}).min(1).messages({
    "object.min": "At least one field must be provided for update."
});

export {
    employeeDeductionsCreateSchema,
    employeeDeductionsUpdateSchema
};
