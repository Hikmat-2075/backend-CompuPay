const payrollItemQueryConfig = {
  // Kolom yang bisa dicari menggunakan search text
  searchableFields: [], // Tidak ada kolom teks, jadi dikosongkan

  // Kolom yang bisa difilter melalui query (?user_id=&payroll_id=&status=)
  filterableFields: ["payroll_id", "user_id"],

  // Kolom yang boleh dipakai sorting ASC/DESC
  orderableFields: [
    "id",
    "payroll_id",
    "user_id",
    "present",
    "absent",
    "late",
    "salary",
    "allowance_amount",
    "deductions",
    "net",
    "created_at",
    "updated_at",
  ],

  // Relasi yang boleh di-include
  relations: {
    payroll: true,
    employee: true,
  },

  // Field tanggal untuk range query (?startDate=&endDate=)
  dateFields: {
    created_at: true,
    updated_at: true,
  },
};

export default payrollItemQueryConfig;
