import Joi from "joi";

const payrollItemCreateSchema = Joi.object({
    payrollId: Joi.string().uuid().required().messages({
        "string.empty": "Payroll ID is required.",
        "string.guid": "Payroll ID must be a valid UUID."
    }),
    employeeId: Joi.string().uuid().required().messages({
        "string.empty": "Employee ID is required.",
        "string.guid": "Employee ID must be a valid UUID."
    }),
    present: Joi.number().integer().min(0).allow(null),
    absent: Joi.number().integer().min(0).allow(null),
    late: Joi.number().integer().min(0).allow(null),

    salary: Joi.number().precision(2).min(0).allow(null),
    allowance_amount: Joi.number().precision(2).min(0).allow(null),
    deductions: Joi.number().precision(2).min(0).allow(null),
    net: Joi.number().precision(2).min(0).allow(null)
});

const payrollItemUpdateSchema = Joi.object({
    present: Joi.number().integer().min(0).allow(null),
    absent: Joi.number().integer().min(0).allow(null),
    late: Joi.number().integer().min(0).allow(null),

    salary: Joi.number().precision(2).min(0).allow(null),
    allowance_amount: Joi.number().precision(2).min(0).allow(null),
    deductions: Joi.number().precision(2).min(0).allow(null),
    net: Joi.number().precision(2).min(0).allow(null)
}).min(1).messages({
    "object.min": "At least one field must be provided for update."
});

export {
    payrollItemCreateSchema,
    payrollItemUpdateSchema
};
