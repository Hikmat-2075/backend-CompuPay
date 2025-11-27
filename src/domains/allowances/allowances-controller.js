import { createdResponse, successResponse } from "../../utils/response.js";
import allowancesService from "./allowances-service.js";

class AllowancesController {

    async create(req, res) {
        const result = await allowancesService.create(req.body);
        return createdResponse(res, result);
    }

    async list(req, res) {
        const query = req.query;
        const result = await allowancesService.list({ query });

        return successResponse(
            res,
            result.data,
            "Allowances retrived successfully",
            result.meta
        );
    }

    async detail(req, res) {
        const result = await allowancesService.detail(req.params.id);
    return successResponse(res, result);
    }

    async update() {
        const result = await allowancesService.update(
            req.allowances,
            req.params.id,
            req.body
        );
        return successResponse(res, result);
    }

    async remove(req, res) {
        const result = await allowancesService.remove(req.params.id);
        return successResponse(res, result);
    }
}

export default new AllowancesController();