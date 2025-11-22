import { createdResponse, successResponse } from "../../utils/response.js";
import EmployeeService from "./employee-service.js";

class EmployeeContoller {
    async create(req, res) {
        const result = await EmployeeService.create(req.user, req.body);
        return createdResponse(res, result);
    }

    async list(req, res) {
        const query = req.query;
        const result = await EmployeeService.list({ query });

        return successResponse(
            res,
            result.data,
            "branch retrieved successfully",
            result.meta
        );
    }

    async detail(req, res) {
        const result = await EmployeeService.detail(req.params.id);
    return successResponse(res, result);
    }

    async update(req, res) {
        const result = await EmployeeService.update(
            req.user,
            req.params.id,
            req.body
        );
        return successResponse(res, result);
    }

    async remove(req, res) {
        const result = await EmployeeService.remove(req.params.id);
        return successResponse(res, result);
    }
}

export default new EmployeeContoller();