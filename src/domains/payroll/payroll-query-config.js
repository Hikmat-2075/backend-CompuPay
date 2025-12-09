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

    messages: {
        SEARCH_NOT_ALLOWED: (field) =>
            `Field "${field}" tidak dapat digunakan untuk pencarian.`,
        FILTER_NOT_ALLOWED: (field) =>
            `Field "${field}" tidak tersedia untuk filter.`,
        ORDER_NOT_ALLOWED: (field) =>
            `Field "${field}" tidak dapat digunakan untuk pengurutan.`,
        INVALID_DATE: (field) =>
            `Format tanggal pada field "${field}" tidak valid (gunakan format ISO yyyy-mm-dd).`,
    },
};

export default payrollQueryConfig;
