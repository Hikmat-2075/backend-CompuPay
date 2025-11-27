const positionQueryConfig = {
    searchableFields: ["name"],

    filterableFields: ["name", "departmentId"],

    orderableFields: [
        "id",
        "name",
        "departmentId",
        "created_at",
        "updated_at"
    ],

    relations: {
        department: true,
        employees: true,
        levels: true
    },

    dateFields: {
        created_at: true,
        updated_at: true
    }
};

export default positionQueryConfig;
