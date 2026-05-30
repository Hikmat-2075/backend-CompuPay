import Joi from "joi";

const attendanceCreateSchema = Joi.object({
	datetime_log: Joi.date().optional().messages({
		"date.base": "Datetime log must be a valid date",
	}),

	latitude: Joi.number().min(-90).max(90).required().messages({
		"any.required": "Latitude is required",
		"number.base": "Latitude must be a number",
		"number.min": "Latitude must be greater than or equal to -90",
		"number.max": "Latitude must be less than or equal to 90",
	}),

	longitude: Joi.number().min(-180).max(180).required().messages({
		"any.required": "Longitude is required",
		"number.base": "Longitude must be a number",
		"number.min": "Longitude must be greater than or equal to -180",
		"number.max": "Longitude must be less than or equal to 180",
	}),

	accuracy: Joi.number().min(0).required().messages({
		"any.required": "GPS accuracy is required",
		"number.base": "GPS accuracy must be a number",
		"number.min": "GPS accuracy cannot be negative",
	}),
	photo: Joi.any().optional(),
});

export { attendanceCreateSchema };
