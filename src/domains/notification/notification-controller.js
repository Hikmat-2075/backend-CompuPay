import { createdResponse, successResponse } from "../../utils/response.js";
import notificationService from "./notification-service.js";

class NotificationController {
  async saveDeviceToken(req, res) {
    const result = await notificationService.saveDeviceToken(
      req.user,
      req.body,
    );

    return createdResponse(res, result, "Device token saved successfully");
  }

  async removeDeviceToken(req, res) {
    const result = await notificationService.removeDeviceToken(
      req.user,
      req.body,
    );

    return successResponse(res, result, "Device token removed successfully");
  }

  async list(req, res) {
    const result = await notificationService.list(req.user, req.query);

    return successResponse(
      res,
      result.data,
      "Notifications retrieved successfully",
      result.meta,
    );
  }

  async markAsRead(req, res) {
    const result = await notificationService.markAsRead(
      req.user,
      req.params.id,
    );

    return successResponse(res, result, "Notification marked as read");
  }

  async markAllAsRead(req, res) {
    const result = await notificationService.markAllAsRead(req.user);

    return successResponse(res, result, result.message);
  }
}

export default new NotificationController();
