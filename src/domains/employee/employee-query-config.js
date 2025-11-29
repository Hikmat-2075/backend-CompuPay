const employeeQueryConfig = {
    // Kolom yang bisa dicari dengan search text
    searchableFields: [
        "employee_number",
        "name",
        "email"
    ],

    // Kolom yang bisa difilter langsung (misal ?status=ACTIVE)
    filterableFields: [
        "employee_number",
        "name",
        "email",
        "status",
        "departmentId",
        "positionId"
    ],

    // Kolom yang boleh dipakai untuk sorting (ASC/DESC)
    orderableFields: [
        "id",
        "employee_number",
        "name",
        "email",
        "status",
        "join_date",
        "salary"
    ],

    // Relasi yang boleh di-include
    relations: {
        department: true,
        position: true,
        employeeAllowances: true,
        employeeDeductions: true,
        attendance: true,
        payrollItems: true,
    },

    // Field tanggal yang boleh dipakai untuk range query (?startDate=&endDate=)
    dateFields: {
        join_date: true
    },
};

export default employeeQueryConfig;
