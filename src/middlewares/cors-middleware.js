import cors from "cors";

const allowedOrigins = ["https://laskara.api.dev.cciunitel.com"];

const corsMiddleware = cors({
	origin: function (origin, callback) {
		if (!origin) return callback(null, true);

		// izinkan localhost port berapa saja
		if (
			origin.startsWith("http://localhost:") ||
			allowedOrigins.includes(origin)
		) {
			return callback(null, true);
		}

		return callback(new Error("Not allowed by CORS"));
	},

	credentials: true,
});

export default corsMiddleware;
