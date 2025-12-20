import { createdResponse, successResponse } from "../../utils/response.js";
import attendanceService from "./attendance-service.js";

class AttendanceController {

    async create(req, res) {
        const result = await attendanceService.create(req.body);
        return createdResponse(res, result);
    }

    async list(req, res) {
        const query = req.query;
        const result = await attendanceService.list({ query });

        return successResponse(
            res,
            result.data,
            "Attendance retrived successfully",
            result.meta
        );
    }

    async detail(req, res) {
        const result = await attendanceService.detail(req.params.id);
    return successResponse(res, result);
    }

    async update(req, res) {
        const result = await attendanceService.update(
            req.attendances,
            req.params.id,
            req.body
        );
        return successResponse(res, result);
    }

    async remove(req, res) {
        const result = await attendanceService.remove(req.params.id);
        return successResponse(res, result);
    }
}

export default new AttendanceController();