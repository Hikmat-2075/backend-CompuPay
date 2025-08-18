import "dotenv/config";

import { __dirname, __filename } from "./utils/path.js";

import apicache from "apicache";
import compression from "compression";
import errorHandler from "./middlewares/error-handler-middleware.js";
import express from "express";
import helmet from "helmet";
import logger from "./utils/logger.js";
import path from "path";
import { queryParser } from "express-query-parser";
import cookieParser from "cookie-parser";

import BaseError from "./base_classes/base-error.js";
import routes from "./routes.js";
import morgan from "morgan";
import corsMiddleware from "./middlewares/cors-middleware.js";

class ExpressApplication {
	app;
	fileStorage;
	fileFilter;
	constructor(port) {
		this.app = express();
		this.port = port;

		this.app.use(express.json({ type: "application/json" }));
		this.app.use(
			queryParser({
				parseNull: true,
				parseBoolean: true,
				parseNumber: true,
			}),
		);

		this.app.use(express.urlencoded({ extended: false }));
		this.app.use(corsMiddleware);
		this.app.use(cookieParser());
		//  __init__
		this.configureAssets();
		this.setupRoute();
		this.setupMiddlewares([
			errorHandler,
			express.json(),
			express.urlencoded(),
			apicache.middleware("5 minutes"),
		]);
		this.setupLibrary([
			process.env.NODE_ENV === "development" ? morgan("dev") : "",
			compression(),
			helmet(),
		]);
	}

	setupMiddlewares(middlewaresArr) {
		middlewaresArr.forEach((middleware) => {
			this.app.use(middleware);
		});
	}
	setupRoute() {
		this.app.get("/hello-world", (req, res) => {
			res.status(200).json({
				message: "Hello World",
			});
		});

		this.app.use("/api/", routes);

		this.app.use("/*", () => {
			throw BaseError.notFound("Route not found");
		});
	}

	configureAssets() {
		this.app.use("/public", express.static(path.join(__filename, "public")));
	}

	setupLibrary(libraries) {
		libraries.forEach((library) => {
			if (library != "" && library != null) {
				this.app.use(library);
			}
		});
	}

	start() {
		return this.app.listen(this.port, () => {
			logger.info(`Application running on port ${this.port}`);
		});
	}
}

export default ExpressApplication;
