import { successResponse } from "../../utils/response.js";
import pointRecordService from "./PointRecord-service.js";

class PointRecordController {
  async list(req, res) {
    const result = await pointRecordService.list({
      currentUser: req.user,
      query: req.query,
    });

    return successResponse(
      res,
      result.data,
      "Point record retrieved successfully",
      result.meta,
    );
  }

  async detail(req, res) {
    const result = await pointRecordService.detail(req.user, req.params.id);
    return successResponse(res, result);
  }

  async update(req, res) {
    const result = await pointRecordService.update(
      req.user,
      req.params.id,
      req.body,
    );

    return successResponse(res, result, "Point record updated successfully");
  }

  async remove(req, res) {
    const result = await pointRecordService.remove(req.user, req.params.id);
    return successResponse(res, result.message);
  }
}

export default new PointRecordController();
