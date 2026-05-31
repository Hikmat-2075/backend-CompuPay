const pointRecordQueryConfig = {
  searchableFields: [
    "attendance.users.full_name",
    "attendance.users.email",
    "attendance.users.employee_number",
  ],

  filterableFields: ["id", "attendanceId", "point"],

  orderableFields: ["id", "attendanceId", "point", "created_at", "updated_at"],

  relations: {
    attendance: {
      include: {
        users: {
          select: {
            id: true,
            employee_number: true,
            full_name: true,
            email: true,
            role: true,
            status: true,
            department: true,
            position: true,
          },
        },
      },
    },
  },

  dateFields: {
    created_at: "created_at",
    updated_at: "updated_at",
  },
};

export default pointRecordQueryConfig;
