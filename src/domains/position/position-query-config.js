const positionQueryConfig = {
    searchableFields: ["name"],

    filterableFields: ["name", "departmentId"],

    orderableFields: [
        "id",
        "name",
        "departmentId"
    ],

    relations: {
        department: true,
        employees: true
    },

    dateFields: {}, // Model Position tidak memiliki field tanggal
};

export default positionQueryConfig;
