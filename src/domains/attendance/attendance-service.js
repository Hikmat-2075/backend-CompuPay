import BaseError from "../../base_classes/base-error.js";
import { PrismaService } from "../../common/services/prisma.service.js";
import { buildQueryOptions } from "../../utils/buildQueryOptions.js";
import attendanceQueryConfig from "./attendance-query-config.js"; // ✅ FIX typo
import Joi from "joi";

class AttendanceService {
    constructor() {
        this.prisma = new PrismaService();
    }

    async create(data) { // ✅ FIX param
        let validation = "";
        const stack = [];

        const fail = (msg, path) => {
            validation += (validation ? " " : "") + msg;
            stack.push({ message: msg, path: [path] });
        };

        return this.prisma.$transaction(async (tx) => {

            const startDay = new Date(data.datetime_log);
            startDay.setHours(0, 0, 0, 0);

            const endDay = new Date(data.datetime_log);
            endDay.setHours(23, 59, 59, 999);

            const attendanceExist = await tx.attendance.findFirst({
                where: {
                    employeeId: data.employeeId,
                    datetime_log: {
                        gte: startDay,
                        lt: endDay
                    }
                }
            });

            if (attendanceExist) {
                fail("Attendance for this employee already exists today", "employeeId");
                throw new Joi.ValidationError(validation, stack); // ✅ FIX
            }

            const created = await tx.attendance.create({ data });

            if (!created) {
                throw new Error("Failed to create Attendance");
            }

            return created;
        });
    }

    async detail(id) {
        const attendance = await this.prisma.attendance.findUnique({
            where: { id }
        });

        if (!attendance) {
            throw BaseError.notFound("Attendance not found");
        }

        return attendance;
    }

    async list({ query } = {}) {
        const options = buildQueryOptions(attendanceQueryConfig, query);

        const [data, count] = await Promise.all([
            this.prisma.attendance.findMany(options),
            this.prisma.attendance.count({ where: options.where }),
        ]);

        const page = query?.pagination?.page ?? 1;
        const limit = query?.pagination?.limit ?? 10;
        const hasPagination = !!(query?.pagination && !query?.get_all);
        const totalPages = hasPagination ? Math.ceil(count / limit) : 1;

        return {
            data,
            meta: hasPagination
                ? {
                    totalItems: count,
                    totalPages,
                    currentpage: Number(page),
                    itemsPerPage: Number(limit),
                }
                : null,
        };
    }

    async update(id, data) { // ✅ FIX param
        return this.prisma.$transaction(async (tx) => {

            const current = await tx.attendance.findUnique({ where: { id } });

            if (!current) {
                throw BaseError.notFound("Attendance not found");
            }

            let validation = "";
            const stack = [];

            const fail = (message, path) => {
                validation += (validation ? " " : "") + message;
                stack.push({ message, path: [path] });
            };

            if (data.employeeId || data.datetime_log) {

                const newEmployeeId = data.employeeId ?? current.employeeId;
                const newLogDate = data.datetime_log ?? current.datetime_log;

                const startDay = new Date(newLogDate);
                startDay.setHours(0, 0, 0, 0);

                const endDay = new Date(newLogDate);
                endDay.setHours(23, 59, 59, 999);

                const attendanceExist = await tx.attendance.findFirst({
                    where: {
                        employeeId: newEmployeeId,
                        datetime_log: {
                            gte: startDay,
                            lt: endDay
                        },
                        NOT: { id }
                    }
                });

                if (attendanceExist) {
                    fail("Attendance for this employee already exists today", "employeeId");
                    throw new Joi.ValidationError(validation, stack);
                }
            }

            const updated = await tx.attendance.update({
                where: { id },
                data,
            });

            return updated;
        });
    }

    async remove(id) {
        const deleted = await this.prisma.attendance.delete({
            where: { id }
        });

        return {
            message: "Attendance deleted successfully",
            data: deleted
        };
    }
}

export default new AttendanceService();