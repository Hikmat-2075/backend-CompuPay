const pointRecordQueryConfig = {
  // search pegawai lewat attendance.users
  searchableFields: [
    "attendance.users.full_name",
    "attendance.users.id",
    "attendance.users.employee_number",
  ],

  filterableFields: ["attendanceId"],

  orderableFields: ["id", "point", "created_at", "updated_at"],

  relations: {
    attendance: {
      users: true,
    },
  },

  dateFields: {
    created_at: "created_at",
    updated_at: "updated_at",
  },
};

export default pointRecordQueryConfig;