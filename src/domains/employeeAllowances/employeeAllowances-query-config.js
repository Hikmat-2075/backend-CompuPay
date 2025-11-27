const employeeAllowancesQueryConfig = {
    searchableFields: ["type"],

    filterableFields: [
        "employeeId",
        "allowanceId",
        "type"
    ],

    orderableFields: [
        "id",
        "employeeId",
        "allowanceId",
        "type",
        "amount",
        "effective_date",
        "created_at"
    ],

    relations: {
        employee: true,
        allowance: true
    },

    dateFields: [
        "effective_date",
        "created_at",
        "updated_at"
    ]
};

export default employeeAllowancesQueryConfig;
