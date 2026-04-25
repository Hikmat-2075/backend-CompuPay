import Joi from "joi";

const leaveRequestCreateSchema = Joi.object({
    type: Joi.string().valid("CUTI", "SAKIT").required().messages({
        "any.only": "Type must be one of CUTI or SAKIT.",
        "any.required": "Type is required.",
    }),
    startDate: Joi.date().required().messages({
        "date.base": "startDate must be a valid date.",
        "any.required": "startDate is required.",
    }),
    endDate: Joi.date().required().messages({
        "date.base": "endDate must be a valid date.",
        "any.required": "endDate is required.",
    }),
    reason: Joi.string().trim().required().messages({
        "string.empty": "Reason is required.",
        "any.required": "Reason is required.",
    }),
    attachment: Joi.string().allow(null, "").optional(),
}).custom((value, helpers) => {
    if (new Date(value.endDate) < new Date(value.startDate)) {
        return helpers.error("any.invalid");
    }

    return value;
}).messages({
    "any.invalid": "endDate must be greater than or equal to startDate.",
});

const leaveRequestUpdateSchema = Joi.object({
    type: Joi.string().valid("CUTI", "SAKIT").optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    reason: Joi.string().trim().optional(),
    attachment: Joi.string().allow(null, "").optional(),
    status: Joi.string().valid("PENDING", "APPROVED", "REJECT").optional(),
}).min(1).custom((value, helpers) => {
    if (value.startDate && value.endDate && new Date(value.endDate) < new Date(value.startDate)) {
        return helpers.error("any.invalid");
    }

    return value;
}).messages({
    "object.min": "At least one field must be provided for update.",
    "any.invalid": "endDate must be greater than or equal to startDate.",
});

export {
    leaveRequestCreateSchema,
    leaveRequestUpdateSchema,
};