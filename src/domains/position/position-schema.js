import Joi from "joi";

const positionCreateSchema = Joi.object({
    name: Joi.string().required().messages({
        "string.empty": "Name is required."
    }),

    departmentId: Joi.string().uuid().required().messages({
        "string.empty": "DepartmentId is required.",
        "any.required": "DepartmentId is required.",
        "string.guid": "Department must be a valid UUID."
    }),

    levels: Joi.array()
        .items(
            Joi.object({
                name: Joi.string().required().messages({
                    "string.empty": "Level name is required."
                })
            })
        )
        .min(1)
        .required()
        .messages({
            "array.base": "Levels must be an array.",
            "array.min": "At least one level is required.",
            "any.required": "Levels are required."
        })
});

const positionUpdateSchema = Joi.object({
    name: Joi.string().optional(),
    departmentId: Joi.string().uuid().optional(),

    levels: Joi.array()
        .items(
            Joi.object({
                id: Joi.string().uuid().optional(), // untuk update existing level
                name: Joi.string().required().messages({
                    "string.empty": "Level name is required."
                })
            })
        )
        .optional()
});

export { positionCreateSchema, positionUpdateSchema };