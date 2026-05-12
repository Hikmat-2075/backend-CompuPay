import { createdResponse, successResponse } from "../../utils/response.js";
import attendanceService from "./attendance-service.js";

class AttendanceController {

    async create(req, res) {
        const data = {
            ...req.body,
            employeeId: req.user.id
        };

        const file = req.file;

        const result = await attendanceService.create(data, file);
        return createdResponse(res, result);
    }

    async today(req, res) {
        const result = await attendanceService.today(req.user.id);
        return successResponse(res, result);
    }

    async list(req, res) {
        const result = await attendanceService.list({ query: req.query });
        return successResponse(res, result.data);
    }

    async detail(req, res) {
        const result = await attendanceService.detail(req.params.id);
        return successResponse(res, result);
    }
}

export default new AttendanceController();