import { createdResponse, successResponse } from "../../utils/response.js";
import attendanceService from "./attendance-service.js";

class AttendanceController {
	async create(req, res) {
		const { type, ...body } = req.body;

		if (!type) {
			throw BaseError.badRequest("Attendance type is required");
		}

		const normalizedType = type.toUpperCase();

		if (!["CHECK_IN", "CHECK_OUT"].includes(normalizedType)) {
			throw BaseError.badRequest("Invalid attendance type");
		}

		const data = {
			...body,
			employeeId: body.employeeId || req.user.id,
		};

		const result = await attendanceService.create(
			data,
			req.file,
			normalizedType,
		);

		return createdResponse(res, result, "Attendance created successfully");
	}

	async checkIn(req, res) {
		const result = await attendanceService.create(
			{
				...req.body,
				employeeId: req.user.id,
			},
			req.file,
			"CHECK_IN",
		);

		return successResponse(res, result, "Check-in successfully");
	}

	async checkOut(req, res) {
		const result = await attendanceService.create(
			{
				...req.body,
				employeeId: req.user.id,
			},
			req.file,
			"CHECK_OUT",
		);

		return successResponse(res, result, "Check-out successfully");
	}

	async today(req, res) {
		const result = await attendanceService.today(req.user.id);
		return successResponse(res, result);
	}

	async list(req, res) {
		const result = await attendanceService.list({ query: req.query });
		return successResponse(res, result.data);
	}

	async detail(req, res) {
		const result = await attendanceService.detail(req.params.id);
		return successResponse(res, result);
	}

	async getConfig(req, res) {
		const result = await attendanceService.getConfig();

		return successResponse(res, result);
	}
}

export default new AttendanceController();
