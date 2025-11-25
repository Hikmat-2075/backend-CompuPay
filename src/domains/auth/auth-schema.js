import Joi from "joi";

const loginSchema = Joi.object({
	email: Joi.string().required().messages({
		"string.empty": "Email is required.",
	}),
	password: Joi.string().required().messages({
		"string.empty": "Password is required.",	
	}),
});

const registerSchema = Joi.object({
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
	password_confirmation: Joi.string()
		.valid(Joi.ref("password"))
		.required()
		.messages({
			"string.empty": "Password confirmation is required.",
			"any.only": "Password confirmation does not match password."
    }),
	role: Joi.string()
		.valid("ADMIN", "EMPLOYEE", "SUPER_ADMIN")
		.default("ADMIN"),
});

const forgetPasswordSchema = Joi.object({
	email: Joi.string().email().required().messages({
		"string.empty": "Email is required.",
		"string.email": "Email must be a valid email address.",
	}),
});

const sendOtpSchema = Joi.object({
	email: Joi.string().email().required().messages({
		"string.empty": "Email is required.",
		"string.email": "Email must be a valid email address.",
	}),
});

const refreshTokenSchema = Joi.object({
	refresh_token: Joi.string().required().messages({
		"string.empty": "Refresh token is required.",
	}),
});

export {
	loginSchema,
	registerSchema,
	sendOtpSchema,
	refreshTokenSchema,
	forgetPasswordSchema,
};
