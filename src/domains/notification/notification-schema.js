import Joi from "joi";

const saveDeviceTokenSchema = Joi.object({
  token: Joi.string().required().messages({
    "any.required": "Device token is required.",
    "string.empty": "Device token is required.",
  }),

  platform: Joi.string()
    .valid("android", "ios", "web")
    .optional()
    .allow(null, "")
    .messages({
      "any.only": "Platform must be android, ios, or web.",
    }),
});

const removeDeviceTokenSchema = Joi.object({
  token: Joi.string().required().messages({
    "any.required": "Device token is required.",
    "string.empty": "Device token is required.",
  }),
});

export { saveDeviceTokenSchema, removeDeviceTokenSchema };
