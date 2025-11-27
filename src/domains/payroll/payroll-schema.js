import Joi from "joi";

const payrollCreateSchema = Joi.object({
    ref_no: Joi.string().trim().required().messages({
        "string.empty": "Reference number is required",
        "any.required": "Reference number is required",
    }),

    date_from: Joi.date().required().messages({
        "date.base": "Date from must be a valid date",
        "any.required": "Date from is required",
    }),

    date_to: Joi.date().required().messages({
        "date.base": "Date to must be a valid date",
        "any.required": "Date to is required",
    }),

    type: Joi.string()
        .uppercase()
        .valid("MONTHLY", "BONUS", "ADHOC")
        .required()
        .messages({
            "any.only": "Type must be one of: MONTHLY, BONUS, ADHOC",
            "any.required": "Type is required",
        }),

    status: Joi.string()
        .uppercase()
        .valid("DRAFT", "POSTED", "PAID", "CANCELLED")
        .required()
        .messages({
            "any.only": "Status must be one of: DRAFT, POSTED, PAID, CANCELLED",
            "any.required": "Status is required",
        }),
});


const payrollUpdateSchema = Joi.object({
    ref_no: Joi.string().trim().optional(),

    date_from: Joi.date().optional().messages({
        "date.base": "Date from must be a valid date",
    }),

    date_to: Joi.date().optional().messages({
        "date.base": "Date to must be a valid date",
    }),

    type: Joi.string()
        .uppercase()
        .valid("MONTHLY", "BONUS", "ADHOC")
        .optional()
        .messages({
            "any.only": "Type must be one of: MONTHLY, BONUS, ADHOC",
        }),

    status: Joi.string()
        .uppercase()
        .valid("DRAFT", "POSTED", "PAID", "CANCELLED")
        .optional()
        .messages({
            "any.only": "Status must be one of: DRAFT, POSTED, PAID, CANCELLED",
        }),
}).min(1).messages({
    "object.min": "At least one field must be updated",
});

export { payrollUpdateSchema, payrollCreateSchema };