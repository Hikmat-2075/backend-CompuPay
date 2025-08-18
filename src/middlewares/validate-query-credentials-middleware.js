const validateQueryCredentials = (schema) => (req, res, next) => {
	const validated = schema.validate(req.query, {
		abortEarly: false,
		errors: {
			wrap: {
				label: "",
			},
		},
		convert: true,
	});
	req.query = validated.value;

	if (validated.error) {
		validated.error.source = "query";
		next(validated.error);
	} else {
		req.query = validated.value;
		next();
	}
};

export default validateQueryCredentials;
