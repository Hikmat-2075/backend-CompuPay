import Joi from "joi";

const employeeCreateSchema = Joi.object({
    employee_number: Joi.string().required().messages({
        "string.empty": "Employee number is required.",
    }),

    name: Joi.string().required().messages({
        "string.empty": "Name is required.",
    }),

    email: Joi.string().email().required().messages({
        "string.empty": "Email is required.",
        "string.email": "Email must be a valid email.",
    }),

    profile_uri: Joi.string().uri().optional().messages({
        "string.uri": "Profile image must be a valid URL.",
    }),

    status: Joi.string().valid("ACTIVE", "INACTIVE").default("ACTIVE").messages({
        "any.only": "Status must be either ACTIVE or INACTIVE.",
    }),

    join_date: Joi.date().required().messages({
        "any.required": "Join date is required.",
        "date.base": "Join date must be a valid date.",
    }),

    departmentId: Joi.string().uuid().required().messages({
        "string.guid": "departmentId must be a valid UUID.",
        "any.required": "Department is required.",
    }),

    positionId: Joi.string().uuid().required().messages({
        "string.guid": "positionId must be a valid UUID.",
        "any.required": "Position is required.",
    }),

    salary: Joi.number().integer().min(0).required().messages({
        "number.base": "Salary must be a number.",
        "number.min": "Salary cannot be negative.",
        "any.required": "Salary is required.",
    }),
});


const employeeUpdateSchema = Joi.object({
    employee_number: Joi.string(),

    name: Joi.string(),

    email: Joi.string().email().messages({
        "string.email": "Email must be a valid email.",
    }),

    profile_uri: Joi.string().uri().messages({
        "string.uri": "Profile image must be a valid URL.",
    }),

    status: Joi.string().valid("ACTIVE", "INACTIVE"),

    join_date: Joi.date().messages({
        "date.base": "Join date must be a valid date.",
    }),

    departmentId: Joi.string().uuid().messages({
        "string.guid": "departmentId must be a valid UUID.",
    }),

    positionId: Joi.string().uuid().messages({
        "string.guid": "positionId must be a valid UUID.",
    }),

    salary: Joi.number().integer().min(0).messages({
        "number.base": "Salary must be a number.",
        "number.min": "Salary cannot be negative.",
    }),
});


export { 
    employeeCreateSchema,
    employeeUpdateSchema, 
};