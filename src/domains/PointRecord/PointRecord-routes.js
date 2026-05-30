import BaseRoutes from "../../base_classes/base-routes.js";
import PointRecordController from "./PointRecord-controller.js";

import tryCatch from "../../utils/tryCatcher.js";
import authTokenMiddleware from "../../middlewares/auth-token-middleware.js";

class PointRecordRoutes extends BaseRoutes {
	routes() {
		this.router.get("/", [
			authTokenMiddleware.authenticate,
			tryCatch(PointRecordController.list),
		]);

		this.router.get("/:id", [
			authTokenMiddleware.authenticate,
			tryCatch(PointRecordController.detail),
		]);
	}
}

export default new PointRecordRoutes().router;
