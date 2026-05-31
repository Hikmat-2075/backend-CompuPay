import { successResponse } from "../../utils/response.js";
import attendanceService from "./attendance-service.js";

class AttendanceController {
  async checkIn(req, res) {
    const result = await attendanceService.create(
      {
        ...req.body,
        employeeId: req.user.id,
      },
      req.file,
      "CHECK_IN",
    );

    return successResponse(res, result, "Check-in successfully");
  }

  async checkOut(req, res) {
    const result = await attendanceService.create(
      {
        ...req.body,
        employeeId: req.user.id,
      },
      req.file,
      "CHECK_OUT",
    );

    return successResponse(res, result, "Check-out successfully");
  }

  async today(req, res) {
    const result = await attendanceService.today(req.user.id);
    return successResponse(res, result);
  }

  async list(req, res) {
    const result = await attendanceService.list({ query: req.query });

    return successResponse(
      res,
      result.data,
      "Attendance retrieved successfully",
      {
        totalItems: result.count,
      },
    );
  }

  async detail(req, res) {
    const result = await attendanceService.detail(req.params.id);
    return successResponse(res, result);
  }

  async getConfig(req, res) {
    const result = await attendanceService.getConfig();
    return successResponse(res, result);
  }
}

export default new AttendanceController();
