import BaseError from "../../base_classes/base-error.js";
import { PrismaService } from "../../common/services/prisma.service.js";
import { buildQueryOptions } from "../../utils/buildQueryOptions.js";
import attendanceQueryConfig from "./attendace-query-config.js";
import Joi from "joi";

class AttendanceService {
  constructor() {
    this.prisma = new PrismaService();
  }
  async create(currentUser, data) {
    let validation = "";
    const stack = [];
    const fail = (msg, path) => {
      validation += (validation ? " " : "") + msg;
      stack.push({ message: msg, path: [path] });
    };

    return this.prisma.$transaction(async (tx) => {
      // Check existing attendance for same employee & same date
      const attendanceExist = await tx.attendance.findFirst({
        where: {
          user_id: data.user_id,
          datetime_log: {
            gte: new Date(new Date(data.datetime_log).setHours(0, 0, 0, 0)),
            lt: new Date(new Date(data.datetime_log).setHours(23, 59, 59, 999)),
          },
        },
      });

      if (attendanceExist) {
        fail("Attendance for this employee already exists today", "user_id");
        throw new Joi.validation(validation, stack);
      }

      const employee = await tx.attendance.findUnique({
        where: {
          user_id: data.user_id,
        },
      });

      if (!employee) {
        fail("Employee not found", "user_id");
        throw new Joi.ValidationError(validation, stack);
      }

      // Create
      const created = await tx.attendance.create({
        data,
      });

      if (!created) {
        throw new Error("Failed to create Attendance");
      }

      return created;
    });
  }

  async detail(id) {
    const attendace = await this.prisma.attendance.findUnique({
      where: { id },
      include: attendanceQueryConfig.relations,
    });
    if (!attendace) {
      throw BaseError.notFound("Attendance not found");
    }
    return attendace;
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

  async update(currentUser, id, data) {
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

      // Jika user ingin ubah user_id atau datetime
      if (data.user_id || data.datetime_log) {
        const newEmployeeId = data.user_id ?? current.user_id;
        const newLogDate = data.datetime_log ?? current.datetime_log;

        const startDay = new Date(newLogDate);
        startDay.setHours(0, 0, 0, 0);

        const endDay = new Date(newLogDate);
        endDay.setHours(23, 59, 59, 999);

        // Check duplicate attendance
        const attendanceExist = await tx.attendance.findFirst({
          where: {
            user_id: newEmployeeId,
            datetime_log: {
              gte: startDay,
              lt: endDay,
            },
            NOT: { id },
          },
        });

        if (attendanceExist) {
          fail("Attendance for this employee already exists today", "user_id");
          throw new Joi.ValidationError(validation, stack);
        }
      }

      // Update attendance
      const updated = await tx.attendance.update({
        where: { id },
        data,
      });

      return updated;
    });
  }

  async remove(id) {
    const deleted = await this.prisma.attendance.delete({ where: { id } });

    return { message: "Attendance deleted successfully", data: deleted };
  }
}

export default new AttendanceService();
