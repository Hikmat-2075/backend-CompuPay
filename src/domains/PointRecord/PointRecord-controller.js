import { successResponse } from "../../utils/response.js";
import pointRecordService from "./PointRecord-service.js";

class PointRecordController {
	async list(req, res) {
		const query = req.query;
		const result = await pointRecordService.list({ query });

		return successResponse(
			res,
			result.data,
			"Point recap retrieved successfully",
			result.meta,
		);
	}

	async detail(req, res) {
		const result = await pointRecordService.detail(req.params.id);
		return successResponse(res, result);
	}
}

export default new PointRecordController();
