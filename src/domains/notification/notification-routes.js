import BaseRoutes from "../../base_classes/base-routes.js";
import tryCatch from "../../utils/tryCatcher.js";
import validateCredentials from "../../middlewares/validate-credentials-middleware.js";
import authTokenMiddleware from "../../middlewares/auth-token-middleware.js";

import notificationController from "./notification-controller.js";
import {
  saveDeviceTokenSchema,
  removeDeviceTokenSchema,
} from "./notification-schema.js";

class NotificationRoutes extends BaseRoutes {
  routes() {
    this.router.get("/", [
      authTokenMiddleware.authenticate,
      tryCatch(notificationController.list),
    ]);

    this.router.post("/device-token", [
      authTokenMiddleware.authenticate,
      validateCredentials(saveDeviceTokenSchema),
      tryCatch(notificationController.saveDeviceToken),
    ]);

    this.router.delete("/device-token", [
      authTokenMiddleware.authenticate,
      validateCredentials(removeDeviceTokenSchema),
      tryCatch(notificationController.removeDeviceToken),
    ]);

    this.router.patch("/read-all", [
      authTokenMiddleware.authenticate,
      tryCatch(notificationController.markAllAsRead),
    ]);

    this.router.patch("/:id/read", [
      authTokenMiddleware.authenticate,
      tryCatch(notificationController.markAsRead),
    ]);
  }
}

export default new NotificationRoutes().router;
