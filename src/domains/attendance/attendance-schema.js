import Joi from "joi";

const attendanceCreateSchema = Joi.object({
    type: Joi.string().valid("CHECK_IN", "CHECK_OUT").required(),
    datetime_log: Joi.date().required(),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    accuracy: Joi.number().optional(),
});

export { attendanceCreateSchema };