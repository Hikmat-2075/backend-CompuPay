const userQueryConfig = {
    searchableFields: [
        "full_name",
        "email",
    ],
    filterableFields: ["role"],
    orderableFields: [
        "id",
        "full_name",
        "email",
        "created_at",
        "updated_at",],
    relations: {
        department: true,
        position: true,
    },
    dateFields: { 
        created_at: "created_at",
        updated_at: "updated_at"
    },
};

export default userQueryConfig;
