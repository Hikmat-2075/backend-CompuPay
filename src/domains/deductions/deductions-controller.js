import { createdResponse, successResponse } from "../../utils/response.js";
import deductionsService from "./deductions-service.js"
class DeductionsController {
    async create(req, res) {
        const result = await deductionsService.create(req.body);
        return createdResponse(res, result);
    }

    async list(req, res) {
        const query = req.query;
        const result = await deductionsService.list({ query });

        return successResponse(
            res,
            result.data,
            "Deductions retrived successfully",
            result.meta
        );
    }

    async detail(req, res) {
        const result = await deductionsService.detail(req.params.id);
    return successResponse(res, result);
    }

    async update() {
        const result = await deductionsService.update(
            req.deductions,
            req.params.id,
            req.body
        );
        return successResponse(res, result);
    }

    async remove(req, res) {
        const result = await deductionsService.remove(req.params.id);
        return successResponse(res, result);
    }
}

export default new DeductionsController();