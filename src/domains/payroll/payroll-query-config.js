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
        users: true
    },

    dateFields: {
        date_from: "Payroll date period from",
        date_to: "Payroll date period to",
    },
};

export default payrollQueryConfig;
