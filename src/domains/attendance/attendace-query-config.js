const attendanceQueryConfig = {
  searchableFields: ["log_type"],

  filterableFields: ["user_id", "log_type"],

  orderableFields: ["id", "datetime_log", "date_updated", "log_type"],

  relations: {
    employee: true,
  },

  dateFields: {
    datetime_log: true,
    date_updated: true,
  },
};

export default attendanceQueryConfig;
