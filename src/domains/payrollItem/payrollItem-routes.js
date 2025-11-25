import BaseRoutes from "../../base_classes/base-routes.js";
import PayrollitemController from "./payrollItem-controller.js";

import tryCatch from "../../utils/tryCatcher.js";
import validateCredentials from '../../middlewares/validate-credentials-middleware.js';

class PayrollitemRoutes extends BaseRoutes {
    routes() {
        this.router.get("/", [tryCatch(PayrollitemController.index)]);
        this.router.get("/:id", [tryCatch(PayrollitemController.show)]);
        this.router.post("/", [tryCatch(PayrollitemController.create)]);
        this.router.put("/:id", [tryCatch(PayrollitemController.update)]);
        this.router.delete("/:id", [tryCatch(PayrollitemController.delete)]);
    }
}

export default new PayrollitemRoutes().router;