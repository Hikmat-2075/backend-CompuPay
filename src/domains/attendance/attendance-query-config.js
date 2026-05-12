const attendanceQueryConfig = {
    searchableFields: ["type", "status"],

    filterableFields: ["employeeId", "type", "status"],

    orderableFields: [
        "datetime_log",
        "created_at",
        "status"
    ],

    relations: {
        employee: true
    },

    dateFields: {
        datetime_log: true,
        created_at: true
    },
};

export default attendanceQueryConfig;