import { createdResponse, successResponse } from "../../utils/response.js";
import userService from "./user-service.js";

class UserController {

    async create(req, res) {
        const result = await userService.create(req.user, req.body, req.file);
        return createdResponse(res, result);
    }

    async list(req, res) {
        const query = req.query;
        const result = await userService.list({ query });

        return successResponse(
            res,
            result.data,
            "User retrieved successfully",
            result.meta
        );
    }

    async detail(req, res) {
        const result = await userService.detail(req.params.id);
    return successResponse(res, result);
    }

    async update(req, res) {
        const result = await userService.update(
            req.user,
            req.params.id,
            req.body,
            req.file,
        );
        return successResponse(res, result);
    }

    async remove(req, res) {
        const result = await userService.remove(req.params.id);
        return successResponse(res, result);
    }
}

export default new UserController();