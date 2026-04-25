const departmentQueryConfig = {
    searchableFields: ["name"],

    filterableFields: ["name"],

    orderableFields: [
        "id",
        "name"
    ],

    relations: {
        users  : true,
        positions: true
    },

    dateFields: {}, // Tidak ada field tanggal di model Department
};

export default departmentQueryConfig;
