import { createdResponse, successResponse } from "../../utils/response.js";
import employeeAllowancesService from "./employeeAllowances-service.js";

class EmployeeAllowancesController {

    async create(req, res) {
        const result = await employeeAllowancesService.create(req.user, req.body);
        return createdResponse(res, result);
    }

    async list(req, res) {
        const query = req.query;
        const result = await employeeAllowancesService.list({ query });

        return successResponse(
            res,
            result.data,
            "Employee Allowances retrieved successfully",
            result.meta
        );
    }

    async detail(req, res) {
        const result = await employeeAllowancesService.detail(req.params.id);
        return successResponse(res, result);
    }

    async update(req, res) {
        const result = await employeeAllowancesService.update(
            req.user,
            req.params.id,
            req.body
        );
        return successResponse(res, result);
    }

    async remove(req, res) {
        const result = await employeeAllowancesService.remove(req.params.id);
        return successResponse(res, result);
    }
}

export default new EmployeeAllowancesController();
