import Joi from "joi";

const userCreateSchema = Joi.object({
    employee_number: Joi.string().required().messages({
        "string.empty": "Employee Number is required."
    }),

    full_name: Joi.string().required().messages({
        "string.empty": "Full name is required."
    }),

    email: Joi.string().email().required().messages({
        "string.empty": "Email is required.",
        "string.email": "Email must be a valid email address."
    }),

    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)
        .required()
        .messages({
            "string.empty": "Password is required.",
            "string.min": "Password must be at least 8 characters long.",
            "string.pattern.base":
                "Password must contain 1 uppercase letter and 1 special character."
        }),

    profile_uri: Joi.string().uri().optional().allow(null, ""),

    role: Joi.string()
        .valid("USER", "ADMIN", "SUPER_ADMIN")
        .default("USER"), // ✅ sesuai Prisma

    join_date: Joi.date()
        .required()
        .messages({
            "any.required": "Join date is required.",
            "date.base": "Join date must be a valid date."
        }),

    department_id: Joi.string()
        .uuid()
        .required()
        .messages({
            "any.required": "Department is required.",
            "string.empty": "Department is required.",
            "string.guid": "Department ID must be a valid UUID."
        }),

    position_id: Joi.string()
        .uuid()
        .required()
        .messages({
            "any.required": "Position is required.",
            "string.empty": "Position is required.",
            "string.guid": "Position ID must be a valid UUID."
        }),

    salary: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "any.required": "Salary is required.",
            "number.base": "Salary must be a number.",
            "number.integer": "Salary must be an integer.",
            "number.positive": "Salary must be greater than 0."
        }),
    status: Joi.string().required().messages({
        "string.empty": "status is required.",
    }),

});

const userUpdateSchema = Joi.object({
    employee_number: Joi.string().optional().allow(""),

    full_name: Joi.string().optional().allow(""),

    email: Joi.string().email().allow("").messages({
        "string.email": "Email must be a valid email address."
    }),

    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)
        .allow("")
        .messages({
            "string.min": "Password must be at least 8 characters long.",
            "string.pattern.base":
                "Password must contain 1 uppercase letter and 1 special character."
        })
        .optional(),

    profile_uri: Joi.string().uri().optional().allow(null, ""),

    role: Joi.string()
        .valid("USER", "ADMIN", "SUPER_ADMIN")
        .optional()
        .allow(""),
    join_date: Joi.date().optional().allow(""),

    department_id: Joi.string().uuid().optional().allow(""),
    position_id: Joi.string().uuid().optional().allow(""),
    salary: Joi.number().integer().positive().optional().allow(""),
    status: Joi.string().valid("ACTIVE", "INACTIVE").optional().allow("")
});


export { userCreateSchema, userUpdateSchema };