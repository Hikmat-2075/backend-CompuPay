const employeeAllowancesQueryConfig = {
  searchableFields: ["type"],

  filterableFields: ["user_id", "allowance_id", "type"],

  orderableFields: [
    "id",
    "user_id",
    "allowance_id",
    "type",
    "amount",
    "effective_date",
    "created_at",
  ],

  relations: {
    users: true,
    allowance: true,
  },

  dateFields: ["effective_date", "created_at", "updated_at"],
};

export default employeeAllowancesQueryConfig;
