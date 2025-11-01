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
	email: Joi.string().email().required().messages({
		"string.empty": "Email is required.",
		"string.email": "Email must be a valid email address.",
	}),
	password: Joi.string()
		.required()
		.min(8)
		.pattern(/^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)
		.messages({
			"string.empty": "Passw2ord is required.",
			"string.min": "Password must be at least 8 characters long.",
			"string.pattern.base":
				"Password must be at least 8 characters long, contain at least 1 uppercase letter, and 1 special character.",
		}),
	password_confirmation: Joi.string()
		.required()
		.valid(Joi.ref("password"))
		.messages({
			"string.empty": "Password confirmation is required.",
			"any.only": "Password confirmation does not match password.",
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
};
