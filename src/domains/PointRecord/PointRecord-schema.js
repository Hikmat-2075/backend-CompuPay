import Joi from "joi";

const pointRecordListQuerySchema = Joi.object({
  search: Joi.string().allow("", null).optional(),

  filter: Joi.object({
    attendanceId: Joi.string().uuid().optional(),
    
    // Range point (Disamakan secara presisi dengan state payload frontend)
    total_point_min: Joi.number().integer().optional(),
    total_point_max: Joi.number().integer().optional(),

    // Filter department
    department_id: Joi.string().uuid().optional(),
  }).optional(),

  pagination: Joi.object({
    page: Joi.number().optional(),
    limit: Joi.number().optional(),
  }).optional(),

  get_all: Joi.boolean().optional(),
  include_relation: Joi.array().items(Joi.string()).optional(),
  order_by: Joi.array().items(
    Joi.object({
      field: Joi.string().required(),
      direction: Joi.string().valid("asc", "desc").optional(),
    })
  ).optional(),
});

export { pointRecordListQuerySchema };