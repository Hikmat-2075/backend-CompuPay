const userQueryConfig = {
    searchableFields: [
        "first_name",
        "last_name",
        "email",
        "role",
    ],
    filterableFields: ["role"],
    orderableFields: [
        "id",
        "first_name",
        "last_name",
        "email",
        "created_at",
        "updated_at",],
    relations: {},
    dateFields: { 
        created_at: "created_at",
        updated_at: "updated_at"
    },
};

export default userQueryConfig;
