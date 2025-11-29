const employeeDeductionsQueryConfig = {
    // Kolom yang bisa dicari dengan search text
    searchableFields: [], // Tidak ada text field seperti "name" atau "code"

    // Kolom yang bisa difilter langsung (misal ?type=MONTHLY&employeeId=...)
    filterableFields: [
        "employeeId",
        "deductionId",
        "type",
    ],

    // Kolom yang boleh dipakai untuk sorting (ASC/DESC)
    orderableFields: [
        "id",
        "employeeId",
        "deductionId",
        "type",
        "amount",
        "effective_date",
        "created_at",
        "updated_at"
    ],

    // Relasi yang boleh di-include
    relations: {
        employee: true,
        deduction: true
    },

    // Field tanggal yang boleh dipakai untuk range query (?startDate=&endDate=)
    dateFields: {
        effective_date: true,
        created_at: true
    },
};

export default employeeDeductionsQueryConfig;
