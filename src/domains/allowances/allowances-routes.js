import BaseRoutes from "../../base_classes/base-routes.js";
import AllowancesController from "./allowances-controller.js";

import tryCatch from "../../utils/tryCatcher.js";
import validateCredentials from '../../middlewares/validate-credentials-middleware.js';

class AllowancesRoutes extends BaseRoutes {
    routes() {
        this.router.get("/", [tryCatch(AllowancesController.index)]);
        this.router.get("/:id", [tryCatch(AllowancesController.show)]);
        this.router.post("/", [tryCatch(AllowancesController.create)]);
        this.router.put("/:id", [tryCatch(AllowancesController.update)]);
        this.router.delete("/:id", [tryCatch(AllowancesController.delete)]);
    }
}

export default new AllowancesRoutes().router;