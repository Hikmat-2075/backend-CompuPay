const employeeAllowancesQueryConfig = {
  searchableFields: ["users.full_name"],

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

  select: {
    users: {
      id: true,
      full_name: true,
      email: true,
    },
  },
};

export default employeeAllowancesQueryConfig;
