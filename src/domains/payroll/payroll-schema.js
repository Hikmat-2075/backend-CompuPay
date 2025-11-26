import { stat } from "fs-extra";
import Joi from "joi";

const payrollCreateSchema = Joi.object({
    ref_no: Joi.string().required().messages({
        "string.empty": "Reference number is required",
    }),

    date_from: Joi.date().required().messages({
        "date.base": "Date from must be a valid date",
        "any.required": "Date from is required",
    }),

    date_to: Joi.date().required().messages({
        "date.base": "Date to must be a valid date",
        "any.required": "Date to is required",
    }), 

    type: Joi.string().valid("monthly", "weekly", "bi-weekly").required().messages({
        "any.only": "Type must be one of 'monthly', 'weekly', or 'bi-weekly'",
        "any.required": "Type is required",
    }),

    status: Joi.string().valid("pending", "processed", "paid").required().messages({
        "any.only": "Status must be one of 'pending', 'processed', or 'paid'",
        "any.required": "Status is required",
    }),
});

const payrollUpdateSchema = Joi.object({
    ref_no: Joi.string().optional(),
    date_from: Joi.date().optional().messages({
        "date.base": "Date from must be a valid date",
    }),
    date_to: Joi.date().optional().messages({
        "date.base": "Date to must be a valid date",
    }),
    type: Joi.string().valid("monthly", "weekly", "bi-weekly").optional().messages({
        "any.only": "Type must be one of 'monthly', 'weekly', or 'bi-weekly'",
    }),
    status: Joi.string().valid("pending", "processed", "paid").optional().messages({
        "any.only": "Status must be one of 'pending', 'processed', or 'paid'",
    }),
});

export { payrollUpdateSchema, payrollCreateSchema };