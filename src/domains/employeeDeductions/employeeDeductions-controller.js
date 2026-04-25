import { createdResponse, successResponse } from "../../utils/response.js";
import employeeDeductionsService from "./employeeDeductions-service.js";

class EmployeedeductionsController {

    async create(req, res) {
        const result = await employeeDeductionsService.create(req.user, req.body);
        return createdResponse(res, result);
    }

    async list(req, res) {
        const query = req.query;
        const result = await employeeDeductionsService.list({ query });

        return successResponse(
            res,
            result.data,
            "Employee Deduction retrieved successfully",
            result.meta
        );
    }

    async detail(req, res) {
        const result = await employeeDeductionsService.detail(req.params.id);
        return successResponse(res, result);
    }

    async update(req, res) {
        const result = await employeeDeductionsService.update(
            req.user,
            req.params.id,
            req.body
        );
        return successResponse(res, result);
    }

    async remove(req, res) {
        const result = await employeeDeductionsService.remove(req.params.id);
        return successResponse(res, result);
    }
}
export default new EmployeedeductionsController();