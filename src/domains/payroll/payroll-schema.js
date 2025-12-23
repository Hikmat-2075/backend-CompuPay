import Joi from "joi";

const payrollCreateSchema = Joi.object({
  ref_no: Joi.string().trim().required().messages({
    "string.empty": "Reference number is required",
    "any.required": "Reference number is required",
  }),

  user_id: Joi.string().uuid().required().messages({
    "string.guid": "Employee ID must be a valid UUID",
    "string.empty": "Employee ID is required",
    "any.required": "Employee ID is required",
  }),

  date_from: Joi.date().required().messages({
    "date.base": "Date from must be a valid date",
    "any.required": "Date from is required",
  }),

  date_to: Joi.date().greater(Joi.ref("date_from")).required().messages({
    "date.base": "Date to must be a valid date",
    "date.greater": "Date to must be after date from",
    "any.required": "Date to is required",
  }),

  type: Joi.string()
    .valid("MONTHLY", "SEMI_MONTHLY")
    .required()
    .messages({
      "any.only": "Type must be either MONTHLY or SEMI_MONTHLY",
      "any.required": "Type is required",
    }),

  // ❗ Status optional, default di backend = PENDING
  status: Joi.string()
    .valid("PENDING")
    .optional()
    .messages({
      "any.only": "Status must be PENDING when creating payroll",
    }),
});


const payrollUpdateSchema = Joi.object({
  ref_no: Joi.string().trim().optional().messages({
    "string.empty": "Reference number cannot be empty",
  }),

  date_from: Joi.date().optional().messages({
    "date.base": "Date from must be a valid date",
  }),

  date_to: Joi.date()
    .greater(Joi.ref("date_from"))
    .optional()
    .messages({
      "date.base": "Date to must be a valid date",
      "date.greater": "Date to must be after date from",
    }),

  type: Joi.string()
    .valid("MONTHLY", "SEMI_MONTHLY")
    .optional()
    .messages({
      "any.only": "Type must be either MONTHLY or SEMI_MONTHLY",
    }),

  status: Joi.string()
    .valid("PENDING", "PAID", "CANCELLED")
    .optional()
    .messages({
      "any.only": "Status must be PENDING, PAID, or CANCELLED",
    }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

export { payrollUpdateSchema, payrollCreateSchema };