const allowancesQueryConfig = {
    searchableFields: ["allowance", "description"],

    filterableFields: ["allowance"],

    orderableFields: [
        "id",
        "allowance"
    ],

    relations: {
        employeeAllowances: true
    },

    dateFields: {}, // Tidak ada field tanggal di model Allowances
};

export default allowancesQueryConfig;
