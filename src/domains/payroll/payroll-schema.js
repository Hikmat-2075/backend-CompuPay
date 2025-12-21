import Joi from "joi";

const payrollCreateSchema = Joi.object({
    ref_no: Joi.string().trim().required().messages({
        "string.empty": "Reference number is required",
        "any.required": "Reference number is required"
    }),

    user_id: Joi.string().uuid().required().messages({
        "string.guid": "Employee ID must be a valid UUID",
        "string.empty": "Employee ID is required",
        "any.required": "Employee ID is required"
    }),

    date_from: Joi.date().required().messages({
        "date.base": "Date from must be a valid date",
        "any.required": "Date from is required"
    }),

    date_to: Joi.date().required().messages({
        "date.base": "Date to must be a valid date",
        "any.required": "Date to is required"
    }),

    type: Joi.string().uppercase().valid("MONTHLY", "SEMI_MONTHLY").required().messages({
        "any.only": "Type must be either MONTHLY or SEMI_MONTHLY",
        "any.required": "Type is required",
        "string.empty": "Type cannot be empty"
    }),

    status: Joi.string().uppercase().valid("PENDING", "PAID", "CANCELLED").required().messages({
        "any.only": "Status must be one of: PENDING, PAID, CANCELLED",
        "any.required": "Status is required",
        "string.empty": "Status cannot be empty"
    }),

    present: Joi.number().integer().min(0).allow(null).messages({
        "number.base": "Present must be a number",
        "number.min": "Present cannot be negative",
        "number.integer": "Present must be an integer"
    }),

    absent: Joi.number().integer().min(0).allow(null).messages({
        "number.base": "Absent must be a number",
        "number.min": "Absent cannot be negative",
        "number.integer": "Absent must be an integer"
    }),

    late: Joi.number().integer().min(0).allow(null).messages({
        "number.base": "Late must be a number",
        "number.min": "Late cannot be negative",
        "number.integer": "Late must be an integer"
    }),

    salary: Joi.number().precision(2).min(0).allow(null).messages({
        "number.base": "Salary must be a number",
        "number.min": "Salary cannot be negative",
        "number.precision": "Salary can have up to 2 decimal places"
    }),

    allowance_amount: Joi.number().precision(2).min(0).allow(null).messages({
        "number.base": "Allowance amount must be a number",
        "number.min": "Allowance amount cannot be negative",
        "number.precision": "Allowance amount can have up to 2 decimal places"
    }),

    deductions: Joi.number().precision(2).min(0).allow(null).messages({
        "number.base": "Deductions must be a number",
        "number.min": "Deductions cannot be negative",
        "number.precision": "Deductions can have up to 2 decimal places"
    }),

    net: Joi.number().precision(2).min(0).allow(null).messages({
        "number.base": "Net must be a number",
        "number.min": "Net cannot be negative",
        "number.precision": "Net can have up to 2 decimal places"
    })
});


const payrollUpdateSchema = Joi.object({
    ref_no: Joi.string().trim().optional().messages({
        "string.empty": "Reference number cannot be empty"
    }),

    user_id: Joi.string().uuid().optional().messages({
        "string.guid": "Employee ID must be a valid UUID"
    }),

    date_from: Joi.date().optional().messages({
        "date.base": "Date from must be a valid date"
    }),

    date_to: Joi.date().optional().messages({
        "date.base": "Date to must be a valid date"
    }),

    type: Joi.string().uppercase().valid("MONTHLY", "SEMI_MONTHLY").optional().messages({
        "any.only": "Type must be either MONTHLY or SEMI_MONTHLY",
        "string.empty": "Type cannot be empty"
    }),

    status: Joi.string().uppercase().valid("PENDING", "PAID", "CANCELLED").optional().messages({
        "any.only": "Status must be one of: PENDING, PAID, CANCELLED",
        "string.empty": "Status cannot be empty"
    }),

    present: Joi.number().integer().min(0).allow(null).messages({
        "number.base": "Present must be a number",
        "number.min": "Present cannot be negative",
        "number.integer": "Present must be an integer"
    }),

    absent: Joi.number().integer().min(0).allow(null).messages({
        "number.base": "Absent must be a number",
        "number.min": "Absent cannot be negative",
        "number.integer": "Absent must be an integer"
    }),

    late: Joi.number().integer().min(0).allow(null).messages({
        "number.base": "Late must be a number",
        "number.min": "Late cannot be negative",
        "number.integer": "Late must be an integer"
    }),

    salary: Joi.number().precision(2).min(0).allow(null).messages({
        "number.base": "Salary must be a number",
        "number.min": "Salary cannot be negative",
        "number.precision": "Salary can have up to 2 decimal places"
    }),

    allowance_amount: Joi.number().precision(2).min(0).allow(null).messages({
        "number.base": "Allowance amount must be a number",
        "number.min": "Allowance amount cannot be negative",
        "number.precision": "Allowance amount can have up to 2 decimal places"
    }),

    deductions: Joi.number().precision(2).min(0).allow(null).messages({
        "number.base": "Deductions must be a number",
        "number.min": "Deductions cannot be negative",
        "number.precision": "Deductions can have up to 2 decimal places"
    }),

    net: Joi.number().precision(2).min(0).allow(null).messages({
        "number.base": "Net must be a number",
        "number.min": "Net cannot be negative",
        "number.precision": "Net can have up to 2 decimal places"
    })
}).min(1).messages({
    "object.min": "At least one field must be provided for update"
});



export { payrollUpdateSchema, payrollCreateSchema };