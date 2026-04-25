import Joi from "joi";

const allowancesCreateSchema = Joi.object({
    allowance: Joi.string().required().messages({
        "string.empty": "Allowances is required",
    }),
    description: Joi.string().allow(null, "").optional(),
});

const allowancesUpdateSchema = Joi.object({
    allowance: Joi.string().optional().allow(""),
    description: Joi.string().allow(null, "").optional().allow(""),
});


export { allowancesCreateSchema, allowancesUpdateSchema };