import Joi from "joi";

const typeEnum = ["MONTHLY", "SEMI_MONTHLY", "ONCE"];

const employeeDeductionsCreateSchema = Joi.object({
	user_id: Joi.string().uuid().required().messages({
		"any.required": "Employee ID is required.",
		"string.empty": "Employee ID is required.",
		"string.guid": "Employee ID must be a valid UUID.",
	}),

	deduction_id: Joi.string().uuid().required().messages({
		"any.required": "Deduction ID is required.",
		"string.empty": "Deduction ID is required.",
		"string.guid": "Deduction ID must be a valid UUID.",
	}),

	type: Joi.string()
		.valid(...typeEnum)
		.required()
		.messages({
			"any.required": "Type is required.",
			"string.empty": "Type is required.",
			"any.only": `Type must be one of: ${typeEnum.join(", ")}`,
		}),

	amount: Joi.number().integer().min(0).required().messages({
		"any.required": "Amount is required.",
		"number.base": "Amount must be a number.",
		"number.min": "Amount cannot be less than 0.",
	}),

	effective_date: Joi.date().iso().required().messages({
		"any.required": "Effective date is required.",
		"date.base": "Effective date must be a valid date.",
		"date.format": "Effective date must be in ISO format.",
	}),
});

const employeeDeductionsUpdateSchema = Joi.object({
	user_id: Joi.string().uuid().optional().allow("").messages({
		"string.guid": "Employee ID must be a valid UUID.",
	}),

	deduction_id: Joi.string().uuid().optional().allow("").messages({
		"string.guid": "Deduction ID must be a valid UUID.",
	}),

	type: Joi.string()
		.valid(...typeEnum)
		.optional()
		.allow("")
		.messages({
			"any.only": `Type must be one of: ${typeEnum.join(", ")}`,
		}),

	amount: Joi.number().integer().min(0).optional().allow("").messages({
		"number.base": "Amount must be a number.",
		"number.min": "Amount cannot be less than 0.",
	}),

	effective_date: Joi.date().iso().optional().allow("").messages({
		"date.base": "Effective date must be a valid date.",
		"date.format": "Effective date must be in ISO format.",
	}),
})
	.min(1)
	.messages({
		"object.min": "At least one field must be provided for update.",
	});

export { employeeDeductionsCreateSchema, employeeDeductionsUpdateSchema };
