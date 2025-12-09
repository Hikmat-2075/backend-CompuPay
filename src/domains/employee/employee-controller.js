import { createdResponse, successResponse } from "../../utils/response.js";
import employeeService from "./employee-service.js";

class EmployeeController {

    async create(req, res) {
        const result = await employeeService.create(req.body);
        return createdResponse(res, result);
    }

    async list(req, res) {
        const query = req.query;
        const result = await employeeService.list({ query });

        return successResponse(
            res,
            result.data,
            "Employee retrived successfully",
            result.meta
        );
    }

    async detail(req, res) {
        const result = await employeeService.detail(req.params.id);
    return successResponse(res, result);
    }

    async update(req ,res) {
        const result = await employeeService.update(
            req.params.id,
            req.body,
            req.file,
        );
        return successResponse(res, result);
    }

    async remove(req, res) {
        const result = await employeeService.remove(req.params.id);
        return successResponse(res, result);
    }
}

export default new EmployeeController();