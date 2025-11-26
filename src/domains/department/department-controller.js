import { createdResponse, successResponse } from "../../utils/response.js";
import departmentService from "./department-service.js";

class DepartmentController {

    async create(req, res) {
        const result = await departmentService.create(req.body);
        return createdResponse(res, result);
    }

    async list(req, res) {
        const query = req.query;
        const result = await departmentService.list({ query });

        return successResponse(
            res,
            result.data,
            "Department retrived successfully",
            result.meta
        );
    }

    async detail(req, res) {
        const result = await departmentService.detail(req.params.id);
    return successResponse(res, result);
    }

    async update() {
        const result = await departmentService.update(
            req.department,
            req.params.id,
            req.body
        );
        return successResponse(res, result);
    }

    async remove(req, res) {
        const result = await departmentService.remove(req.params.id);
        return successResponse(res, result);
    }
}

export default new DepartmentController();