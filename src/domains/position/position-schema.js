import Joi from "joi";

const positionCreateSchema = Joi.object({
    name: Joi.string().required().messages({
        "string.empty": "Name is required."
    }),

    department_id: Joi.string().uuid().required().messages({
        "string.empty": "DepartmentId is required.",
        "any.required": "DepartmentId is required.",
        "string.guid": "Department must be a valid UUID."
    }),
});

const positionUpdateSchema = Joi.object({
    name: Joi.string().optional().messages({
        "string.empty": "Name cannot be empty."
    }),

    department_id: Joi.string().uuid().optional().messages({
        "string.guid": "Department must be a valid UUID."
    })
});


export { positionCreateSchema, positionUpdateSchema };