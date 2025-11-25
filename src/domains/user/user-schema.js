import Joi from "joi";

const userCreateSchema = Joi.object({
    first_name: Joi.string().required().messages({
        "string.empty": "First name is required."
    }),
    last_name: Joi.string().required().messages({
        "string.empty": "Last name is required."
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
            "string.pattern.base": "Password must be at least 8 characters long, contain 1 uppercase letter, and 1 special character."
    }),
    profile_uri: Joi.string().uri().optional().allow(null, ''),

    role: Joi.string()
        .valid("ADMIN", "EMPLOYEE", "SUPER_ADMIN")
        .default("ADMIN"),
});

const userUpdateSchema = Joi.object({
    first_name: Joi.string().optional(),
    last_name: Joi.string().optional(),
    email: Joi.string().email().messages({
        "string.email": "Email must be a valid email address."
    }),
    password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)
    .messages({
        "string.min": "Password must be at least 8 characters long.",
        "string.pattern.base":
        "Password must contain 1 uppercase letter and 1 special character."
    })
    .optional(),
    profile_uri: Joi.string().uri().optional().allow(null, ''),
    role: Joi.string()
    .valid("SUPER_ADMIN", "ADMIN", "EMPLOYEE")
    .optional(),
})
.min(1)
.messages({
    "object.min": "At least one field must be provided for update"
});

export { userCreateSchema, userUpdateSchema };