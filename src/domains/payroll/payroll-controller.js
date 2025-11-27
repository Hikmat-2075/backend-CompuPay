import { createdResponse, successResponse } from "../../utils/response.js";
import payrollService from "./payroll-service.js";

class PayrollController {

    async create(req, res) {
        const result = await payrollService.create(req.body);
        return createdResponse(res, result);
    }
    
    async list(req, res) {
        const query = req.query;
        const result = await payrollService.list({ query });

        return successResponse(
            res,
            result.data,
            "Payroll retrived successfully",
            result.meta
        );
    }
    
    async detail(req, res) {
        const result = await payrollService.detail(req.params.id);
        return successResponse(res, result);
    }
    
    async update(req, res) {
        const result = await payrollService.update(
            req.payroll,
            req.params.id,
            req.body
        );
        return successResponse(res, result);
    }

    async remove(req, res) {
        const result = await payrollService.remove(req.params.id);
        return successResponse(res, result);
    }
}

export default new PayrollController();