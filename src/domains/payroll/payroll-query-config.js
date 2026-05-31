const payrollQueryConfig = {
	searchableFields: [
		"ref_no",
		"employee.full_name",
		"employee.email",
	],

	enumSearchableFields: [
		{
			field: "type",
			values: ["MONTHLY", "BONUS", "THR"],
		},
		{
			field: "status",
			values: ["PENDING", "PAID", "CANCELLED"],
		},
	],

	filterableFields: ["ref_no", "type", "status", "user_id"],

	orderableFields: [
		"id",
		"ref_no",
		"date_from",
		"date_to",
		"type",
		"status",
		"salary",
		"allowance_amount",
		"deductions",
		"net",
		"created_at",
		"updated_at",
	],

	relations: {
		payer: true,
		employee: true,
	},

	dateFields: {
		created_at: "created_at",
		updated_at: "updated_at",
	},
};

export default payrollQueryConfig;