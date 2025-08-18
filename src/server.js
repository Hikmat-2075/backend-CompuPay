import ExpressApplication from "./app.js";
import logger from "./utils/logger.js";

const PORT = process.env.PORT || 3000;

const app = new ExpressApplication(PORT);
const server = app.start();

process.on("SIGTERM", () => {
	logger.warn("SIGTERM RECEIVED!");
	server.close(() => {
		logger.warn("Process Terminated!");
	});
});
