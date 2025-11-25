import Joi from "joi";

const allowancesCreateSchema = Joi.object({
    allowances: Joi.string().required().message({
        "string.empty": "Allowances is required",
    }),
    description: Joi.string().allow(null, "").optional(),
});

const allowancesUpdateSchema = Joi.object({
    allowances: Joi.string().optional(),
    description: Joi.string().allow(null, "").optional,
});

export { allowancesCreateSchema, allowancesUpdateSchema };