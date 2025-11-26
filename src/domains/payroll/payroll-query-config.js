const payrollQueryConfig = {
    searchableFields: ["ref_no", "date_from", "date_to", "type", "status"],

    filterableFields: ["ref_no", "type", "status"],

    orderableFields: [
        "id",
        "ref_no",
        "date_from",
        "date_to",
        "type",
        "status"
    ],

    relations: {
        payrollItem: true
    },

    dateFields: {
        date_from: true,
        date_to: true
    }, 
};

export default payrollQueryConfig;
