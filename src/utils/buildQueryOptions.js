// utils/buildQueryOptions.js

/**
 * @param {Object} modelConfig
 *  - searchableFields: string[]
 *  - filterableFields: string[]
 *  - orderableFields: string[]
 *  - relations: Record<string, any>
 *  - dateFields: { created_at?: string, updated_at?: string }
 * @param {Object} query
 * @param {Object} fixedWhere
 */
export function buildQueryOptions(modelConfig, query = {}, fixedWhere = {}) {
	const {
		searchableFields = [],
		filterableFields = [],
		orderableFields = [],
		relations = {},
		select = {},
		dateFields = { created_at: "created_at", updated_at: "updated_at" },
		jsonSearchableFields = [],
	} = modelConfig;

	const {
		get_all = false,
		pagination,
		order_by,
		include_relation = [],
		search,
		filter = {},
	} = query;

	// WHERE dasar
	const where = { ...(fixedWhere || {}) };

	// 🔍 Search
	if (search != null && String(search).trim() !== "") {
		const searchTerm = String(search);

		const stringSearchConditions = searchableFields.map((fieldPath) => {
			const parts = fieldPath.split(".");
			const leaf = parts.pop();

			const condition = isEnumField(modelConfig, fieldPath)
				? { [leaf]: { equals: searchTerm.toUpperCase() } }
				: { [leaf]: { contains: searchTerm, mode: "insensitive" } };

			return parts.reduceRight((acc, curr) => ({ [curr]: acc }), condition);
		});

		const jsonSearchConditions = jsonSearchableFields.map(({ field, path }) => ({
			[field]: {
				path,
				string_contains: searchTerm,
				mode: "insensitive",
			},
		}));

		where.OR = [...stringSearchConditions, ...jsonSearchConditions];
	}

	// 🎯 Filtering
	if (filterableFields.length > 0) {
		for (const field of filterableFields) {
			const val = filter[field];
			if (val !== undefined) where[field] = val;
		}
	}

	// ⏱ Date range
	const createdField = dateFields.created_at || "created_at";
	const updatedField = dateFields.updated_at || "updated_at";

	if (filter?.created_at) {
		where[createdField] = new Date(filter.created_at);
	} else if (filter?.created_range) {
		const r = {};
		if (filter.created_range.start) r.gte = new Date(filter.created_range.start);
		if (filter.created_range.end) r.lte = new Date(filter.created_range.end);
		where[createdField] = r;
	}

	if (filter?.updated_at) {
		where[updatedField] = new Date(filter.updated_at);
	} else if (filter?.updated_range) {
		const r = {};
		if (filter.updated_range.start) r.gte = new Date(filter.updated_range.start);
		if (filter.updated_range.end) r.lte = new Date(filter.updated_range.end);
		where[updatedField] = r;
	}

	// 🔳 is null / is not null
	if (Array.isArray(filter?.is_null)) {
		where.AND = where.AND || [];
		filter.is_null.forEach((field) => where.AND.push({ [field]: null }));
	}

	if (Array.isArray(filter?.is_not_null)) {
		where.NOT = where.NOT || [];
		filter.is_not_null.forEach((field) => where.NOT.push({ [field]: null }));
	}

	// 📦 Include relations
	const include = {};
	include_relation.forEach((rel) => {
		const relation = relations[rel];
		if (!relation) return;

		if (typeof relation === "object" && !Array.isArray(relation)) {
			include[rel] = {
				include: handleNestedInclude(relation, select[rel]),
			};
		} else if (select[rel]) {
			include[rel] = { select: select[rel] };
		} else {
			include[rel] = true;
		}
	});

	// 🔽 Order by
	let orderBy = [];
	if (Array.isArray(order_by)) {
		orderBy = order_by
			.filter(({ field }) => orderableFields.includes(field))
			.map(({ field, direction = "asc" }) => ({
				[field]: direction.toLowerCase() === "desc" ? "desc" : "asc",
			}));
	}

	// 📄 Pagination
	let take, skip;
	if (!get_all && pagination) {
		const page = Number(pagination.page ?? 1);
		const limit = Number(pagination.limit ?? 10);
		take = limit;
		skip = (page - 1) * limit;
	}

	return {
		where,
		orderBy,
		include,
		...(take ? { take } : {}),
		...(skip ? { skip } : {}),
	};
}

function isEnumField(modelConfig, fieldPath) {
	const enumFields = ["status", "process"];
	return enumFields.some((enumField) => fieldPath.includes(enumField));
}

function handleNestedInclude(nestedRelations, selectColumns) {
	const result = {};

	Object.keys(nestedRelations).forEach((key) => {
		const value = nestedRelations[key];

		if (typeof value === "object" && !Array.isArray(value)) {
			result[key] = {
				include: handleNestedInclude(value, selectColumns?.[key]),
			};
		} else {
			result[key] = selectColumns?.[key]
				? { select: selectColumns[key] }
				: true;
		}
	});

	return result;
}
