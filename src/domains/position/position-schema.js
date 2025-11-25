import Joi from "joi";

const positionCreateSchema = Joi.object({
    name: Joi.string().required().messages({
        "string.empty": "name is required.",
    }),
    departmentId: Joi.string().uuid().messages({
        "string.empty": "departmentId is required.",
        "string.guid": "Department is must be a valid UUID."
    })
});

const positionUpdateSchema = Joi.object({
    name: Joi.string().optional(),
    departmentId: Joi.string().uuid().optional(),
});

export { positionCreateSchema, positionUpdateSchema };