const deductionsQueryConfig = {
    searchableFields: ["deduction", "description"],

    filterableFields: ["deduction"],

    orderableFields: [
        "id",
        "deduction"
    ],

    relations: {
        employeeDeductions: true
    },

    dateFields: {},
};

export default deductionsQueryConfig;