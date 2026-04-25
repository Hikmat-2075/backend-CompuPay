const employeeDeductionsQueryConfig = {
  // Kolom yang bisa dicari dengan search text
  searchableFields: ["users.full_name"], // Tidak ada text field seperti "name" atau "code"

  // Kolom yang bisa difilter langsung (misal ?type=MONTHLY&user_id=...)
  filterableFields: ["user_id", "deduction_id", "type"],

  // Kolom yang boleh dipakai untuk sorting (ASC/DESC)
  orderableFields: [
    "id",
    "user_id",
    "deduction_id",
    "type",
    "amount",
    "effective_date",
    "created_at",
    "updated_at",
  ],

  // Relasi yang boleh di-include
  relations: {
    users: true,
    deduction: true,
  },

  // Field tanggal yang boleh dipakai untuk range query (?startDate=&endDate=)
  dateFields: {
    effective_date: true,
    created_at: true,
  },

  select: {
    users: {
      id: true,
      full_name: true,
      email: true,
    },
  },
};

export default employeeDeductionsQueryConfig;
