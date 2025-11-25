import BaseRoutes from "../../base_classes/base-routes.js";
import DeductionsController from "./deductions-controller.js";

import tryCatch from "../../utils/tryCatcher.js";
import validateCredentials from '../../middlewares/validate-credentials-middleware.js';

class DeductionsRoutes extends BaseRoutes {
    routes() {
        this.router.get("/", [tryCatch(DeductionsController.index)]);
        this.router.get("/:id", [tryCatch(DeductionsController.show)]);
        this.router.post("/", [tryCatch(DeductionsController.create)]);
        this.router.put("/:id", [tryCatch(DeductionsController.update)]);
        this.router.delete("/:id", [tryCatch(DeductionsController.delete)]);
    }
}

export default new DeductionsRoutes().router;