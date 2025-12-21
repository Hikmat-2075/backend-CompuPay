import { createdResponse, successResponse } from "../../utils/response.js";
import payrollItemService from "./payroll-service.js";

class PayrollitemController {
  async create(req, res) {
    const result = await payrollItemService.create(req.body);
    return createdResponse(res, result);
  }

  async list(req, res) {
    const query = req.query;
    const result = await payrollItemService.list({ query });

    return successResponse(
      res,
      result.data,
      "Payroll Item retrieved successfully",
      result.meta
    );
  }

  async detail(req, res) {
    const result = await payrollItemService.detail(req.params.id);
    return successResponse(res, result);
  }

  async update(req, res) {
    const result = await payrollItemService.update(
      req.payroll,
      req.params.id,
      req.body
    );
    return successResponse(res, result);
  }

  async remove(req, res) {
    const result = await payrollItemService.remove(req.params.id);
    return successResponse(res, result);
  }
}

export default new PayrollitemController();
