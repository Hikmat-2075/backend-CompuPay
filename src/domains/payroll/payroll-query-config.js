const payrollQueryConfig = {
    searchableFields: ["ref_no", "type", "status"],

    filterableFields: ["ref_no", "type", "status"],

    orderableFields: [
        "id",
        "ref_no",
        "date_from",
        "date_to",
        "type",
        "status",
        "present",
        "absent",
        "late",
        "salary",
        "allowance_amount",
        "deductions",
        "net"
    ],

    relations: {
        // Tidak ada lagi relation items
        // Jika Payroll punya relasi ke User (misal payroll dibuat oleh HR),
        // tambahkan di sini, contoh:
        // createdBy: true
    },

    dateFields: {
        date_from: "Payroll date period from",
        date_to: "Payroll date period to",
    },
};

export default payrollQueryConfig;
