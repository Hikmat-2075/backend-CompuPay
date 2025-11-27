import { createdResponse, successResponse } from "../../utils/response.js";
import positionService from "./position-service.js";

class PositionController {

    async create(req, res) {
        const result = await positionService.create(req.body);
        return createdResponse(res, result);
    }

    async list(req, res) {
        const query = req.query;
        const result = await positionService.list({ query });

        return successResponse(
            res,
            result.data,
            "Position retrived successfully",
            result.meta
        );
    }

    async detail(req, res) {
        const result = await positionService.detail(req.params.id);
    return successResponse(res, result);
    }

    async update(req, res) {
        const result = await positionService.update(
            req.position,
            req.params.id,
            req.body
        );
        return successResponse(res, result);
    }

    async remove(req, res) {
        const result = await positionService.remove(req.params.id);
        return successResponse(res, result);
    }
}

export default new PositionController();
