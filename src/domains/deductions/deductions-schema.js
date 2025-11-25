import Joi from "joi";

const deductionsCreateSchema = Joi.object({
    deduction: Joi.string().required().messages({
        "string.empty": "deduction is required.",
    }),
    description: Joi.string().allow(null, "").optional()
});

const deductionsUpdateSchema = Joi.object({
    deduction: Joi.string().optional(),
    description: Joi.string().allow(null, "").optional(),
});

export { deductionsCreateSchema, deductionsUpdateSchema };