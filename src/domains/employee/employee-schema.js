import Joi from "joi";

const employeeCreateSchema = Joi.object({
    employee_no: Joi.string().required().messages({
        "string.empty": "employee number is required.",
    }),
    firstname: Joi.string().required().messages({
        "string.empty": "first name is required.",
    }),
    lastname: Joi.string().required().messages({
        "string.empty": "last name is required.",
    }),
    departementId: Joi.string().uuid().required().messages({
        "any.required": "department is required",
        "string.guid": "position is must be a valid UUID",
    }),
    positionId: Joi.string().uuid().required().messages({
        "any.required": "position is required",
        "string.guid": "position is must be a valid UUID"
    }),
    salary: Joi.number().integer().min(0).required().messages({
        "number.base": "salary must be a number",
        "number.min": "salary cannot be negative",
        "any.required": "salary is required",
    }),
});

const employeeUpdateSchema = Joi.object({
    employee_no: Joi.string(),
});

export { 
    employeeCreateSchema,
    employeeUpdateSchema, 
};