export function buildQueryOptions(modelConfig, query = {}, unitId) {
	const {
		searchableFields = [],
		filterableFields = [],
		relations = {},
	} = modelConfig;

	const {
		get_all = false,
		pagination,
		order_by,
		include_relation = [],
		search,
		filter = {},
	} = query;

	const where = {
		...(unitId && { unit_id: unitId }),
	};

	// 🔍 Search
	if (search && searchableFields.length > 0) {
		const searchTermForPrisma = String(search);
		where.OR = searchableFields.map((fieldPath) => {
			const parts = fieldPath.split(".");
			const last = parts.pop();

			// Build nested object, e.g. { discount: { shareable_code: { contains: search } } }
			return parts.reduceRight((acc, curr) => ({ [curr]: acc }), {
				[last]: { contains: searchTermForPrisma },
			});
		});
	}

	// 🎯 Filtering
	for (const field of filterableFields) {
		const value = filter[field];
		if (value !== undefined) {
			where[field] = value;
		}
	}

	// 🧼 Handle is_null & is_not_null
	if (Array.isArray(filter.is_null)) {
		for (const field of filter.is_null) {
			where[field] = null;
		}
	}

	if (Array.isArray(filter.is_not_null)) {
		for (const field of filter.is_not_null) {
			where.NOT = {
				...(where.NOT || {}),
				[field]: null,
			};
		}
	}

	// 📦 Include Relations
	const include = {};
	for (const rel of include_relation) {
		if (relations[rel]) {
			include[rel] = relations[rel];
		}
	}

	// 📊 Order By
	const orderBy = Array.isArray(order_by)
		? order_by.map(({ field, direction }) => ({ [field]: direction }))
		: [];

	// 📄 Pagination
	let take, skip;
	if (!get_all && pagination) {
		take = pagination.limit;
		skip = (pagination.page - 1) * pagination.limit;
	}

	return {
		where,
		orderBy,
		include,
		...(take !== undefined ? { take } : {}),
		...(skip !== undefined ? { skip } : {}),
	};
}
