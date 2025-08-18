import cors from "cors";

const allowedOrigins = [
	"http://localhost:3000",
	"https://laskara.api.dev.cciunitel.com",
];

const corsMiddleware = cors({
	origin: function (origin, callback) {
		if (!origin) return callback(null, true);
		if (allowedOrigins.includes(origin)) {
			return callback(null, true);
		} else {
			return callback(new Error("Not allowed by CORS"));
		}
	},
	credentials: true,
});

export default corsMiddleware;
