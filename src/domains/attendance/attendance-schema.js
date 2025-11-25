import Joi, { required } from "joi";

const LogTypes = [
    "PRESENT",
    "LATE",
    "ABSENT",
    "SICK",
    "LEAVE",
    "OVERTIME"
];

const attendanceCreateSchema = Joi.object({
    employeeId: Joi.string().required().uuid().messages({
        "string.empty": "Employee ID is required.",
        "string.guid": "Employee ID must be a valid UUID"
    }),
    log_type: Joi.string()
    .valid(...LogTypes)
    .required()
    .messages({
        "any.only": `Log type must be one of: ${LogTypes.join(", ")}`,
        "string.empty": "Log type is required.",
    }),
    datetime_log: Joi.date().required().messages({
        "date.base": "Datetime log must be a valid date.",
        "any.required": "Datetime log is required."
    }),
});

const attendanceUpdateSchema = Joi.object({
    employeeId: Joi.string().uuid().optional(),
    log_type: Joi.string().valid(...LogTypes).optional(),
    datetime_log: Joi.date().optional(),
});

export { attendanceCreateSchema, attendanceUpdateSchema };