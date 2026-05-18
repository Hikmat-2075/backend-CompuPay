import { createdResponse, successResponse } from "../../utils/response.js";
import leaveRequestService from "./leaveRequest-service.js";

class LeaverequestController {
    async create(req, res) {
        const result = await leaveRequestService.create(req.user, req.body, req.file);
        return createdResponse(res, result);
    }

    async list(req, res) {
        const result = await leaveRequestService.list(req.user, { query: req.query });

        return successResponse(
            res,
            result.data,
            "Leave request retrieved successfully",
            result.meta
        );
    }

    async detail(req, res) {
        const result = await leaveRequestService.detail(req.user, req.params.id);
        return successResponse(res, result);
    }

    async update(req, res) {
        const result = await leaveRequestService.update(
            req.user,
            req.params.id,
            req.body,
            req.file
        );
        return successResponse(res, result);
    }

    async remove(req, res) {
        const result = await leaveRequestService.remove(req.user, req.params.id);
        return successResponse(res, result);
    }
}

export default new LeaverequestController();