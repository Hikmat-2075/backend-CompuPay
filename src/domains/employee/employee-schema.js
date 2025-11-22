import Joi from "joi";

const createEmployeeSchema = Joi.object({
    full_name: Joi.string().required().messages({
        "string.empty": "Full name is required."
    }),
    
    nip: Joi.string()
        .pattern(/^[0-9]+$/)
        .length(18)
        .required()
        .messages({
        "string.empty": "NIP is required.",
        "string.length": "NIP must be exactly 18 characters long.",
        "string.pattern.base": "NIP must contain only digits."
    }),
    
    email: Joi.string().email().required().messages({
        "string.empty": "Email is required.",
        "string.email": "Email must be a valid email address."
    }),
    
    position: Joi.string().required().messages({
        "string.empty": "Position is required."
    }),
    
    department: Joi.string().required().messages({
        "string.empty": "Department is required."
    }),
    
    phone_number: Joi.string()
        .pattern(/^[0-9]+$/)
        .min(10)
        .max(15)
        .required()
        .messages({
            "string.empty": "Phone number is required.",
            "string.pattern.base": "Phone number must contain only digits.",
            "string.min": "Phone number must be at least 10 digits.",
            "string.max": "Phone number cannot exceed 15 digits."
    }),
    
    address: Joi.string().required().messages({
        "string.empty": "Address is required."
    }),
    
    birth_date: Joi.date().required().messages({
        "date.base": "Birth date must be a valid date.",
        "any.required": "Birth date is required."
    }),
    
    join_date: Joi.date().required().messages({
        "date.base": "Join date must be a valid date.",
        "any.required": "Join date is required."
    }),
    
    work_status: Joi.string()
        .valid("CONTRACT", "PERMANENT", "INTERN")
        .default("CONTRACT")
        .messages({
        "any.only": "Work status must be CONTRACT, PERMANENT, or INTERN."
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
    
    password_confirmation: Joi.string()
        .valid(Joi.ref("password"))
        .required()
        .messages({
            "string.empty": "Password confirmation is required.",
            "any.only": "Password confirmation does not match password."
    })
});

const updateEmployeeSchema = Joi.object({
    full_name: Joi.string().messages({
        "string.base": "Full name must be a string."
    }),

    position: Joi.string().messages({
        "string.base": "Position must be a string."
    }),

    department: Joi.string().messages({
        "string.base": "Department must be a string."
    }),

    phone_number: Joi.string()
        .pattern(/^[0-9]+$/)
        .min(10)
        .max(15)
        .messages({
            "string.pattern.base": "Phone number must contain only digits.",
            "string.min": "Phone number must be at least 10 digits.",
            "string.max": "Phone number cannot exceed 15 digits."
        }),

    address: Joi.string().messages({
        "string.base": "Address must be a string."
    }),

    birth_date: Joi.date().messages({
        "date.base": "Birth date must be a valid date."
    }),

    work_status: Joi.string()
        .valid("CONTRACT", "PERMANENT", "INTERN")
        .messages({
            "any.only": "Work status must be CONTRACT, PERMANENT, or INTERN."
        }),

    base_salary: Joi.number()
        .integer()
        .min(0)
        .messages({
            "number.base": "Base salary must be a number.",
            "number.integer": "Base salary must be an integer.",
            "number.min": "Base salary cannot be negative."
        }),
});



export { createEmployeeSchema, updateEmployeeSchema};