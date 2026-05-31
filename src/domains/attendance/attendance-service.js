import fs from "fs";
import path from "path";
import BaseError from "../../base_classes/base-error.js";
import { PrismaService } from "../../common/services/prisma.service.js";
import attendanceQueryConfig from "./attendance-query-config.js";
import { buildQueryOptions } from "../../utils/buildQueryOptions.js";
import { getDistance } from "../../utils/geo.js";
import { ATTENDANCE_CONFIG } from "../../config/attendance.config.js";

class AttendanceService {
  constructor() {
    this.prisma = new PrismaService();
  }

  getJakartaTimeParts(date) {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(date);

    const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
    const minutes = Number(parts.find((p) => p.type === "minute")?.value ?? 0);

    return {
      hour,
      minutes,
      totalMinutes: hour * 60 + minutes,
    };
  }

  getAttendanceStatus(type, date) {
    const { totalMinutes } = this.getJakartaTimeParts(date);

    const batasMasuk = 9 * 60;
    const batasPulang = 17 * 60;

    if (type === "CHECK_IN") {
      return totalMinutes >= batasMasuk ? "LATE" : "ON_TIME";
    }

    if (type === "CHECK_OUT") {
      return totalMinutes < batasPulang ? "EARLY" : "ON_TIME";
    }

    return "ON_TIME";
  }

  getPointByAttendance(type, date) {
    if (type !== "CHECK_IN") return 0;

    const { totalMinutes } = this.getJakartaTimeParts(date);
    const batasMasuk = 9 * 60;

    return totalMinutes < batasMasuk ? 1 : 0;
  }

  async create(data, file, type) {
    let storedFilePath = null;

    try {
      return await this.prisma.$transaction(async (tx) => {
        if (!file) {
          throw BaseError.badRequest("Photo is required");
        }

        if (type !== "CHECK_IN" && type !== "CHECK_OUT") {
          throw BaseError.badRequest("Invalid attendance type");
        }

        const uploadDir = path.join(process.cwd(), "public/assets/attendance");

        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filename = Date.now() + "-" + file.originalname;
        const filepath = path.join(uploadDir, filename);

        fs.writeFileSync(filepath, file.buffer);
        storedFilePath = filepath;

        data.photo_url = `assets/attendance/${filename}`;

        let now;

        if (data.datetime_log) {
          now = new Date(data.datetime_log);

          if (isNaN(now)) {
            throw BaseError.badRequest("Invalid datetime format");
          }
        } else {
          now = new Date();
        }

        data.datetime_log = now;
        data.type = type;

        const startDay = new Date(now);
        startDay.setHours(0, 0, 0, 0);

        const endDay = new Date(now);
        endDay.setHours(23, 59, 59, 999);

        const today = await tx.attendance.findMany({
          where: {
            employeeId: data.employeeId,
            datetime_log: {
              gte: startDay,
              lt: endDay,
            },
          },
        });

        if (type === "CHECK_IN") {
          if (today.find((a) => a.type === "CHECK_IN")) {
            throw BaseError.badRequest("Already check-in today");
          }
        }

        if (type === "CHECK_OUT") {
          if (!today.find((a) => a.type === "CHECK_IN")) {
            throw BaseError.badRequest("Must check-in first");
          }

          if (today.find((a) => a.type === "CHECK_OUT")) {
            throw BaseError.badRequest("Already check-out today");
          }
        }

        const status = this.getAttendanceStatus(type, now);
        const point = this.getPointByAttendance(type, now);

        data.latitude = Number(data.latitude);
        data.longitude = Number(data.longitude);
        data.accuracy = data.accuracy ? Number(data.accuracy) : null;

        if (data.accuracy === null || isNaN(data.accuracy)) {
          throw BaseError.badRequest("Invalid GPS accuracy");
        }

        if (data.accuracy > 200) {
          throw BaseError.badRequest("GPS accuracy too low");
        }

        if (isNaN(data.latitude) || isNaN(data.longitude)) {
          throw BaseError.badRequest("Invalid coordinates");
        }

        const distance = getDistance(
          ATTENDANCE_CONFIG.OFFICE_LAT,
          ATTENDANCE_CONFIG.OFFICE_LNG,
          data.latitude,
          data.longitude,
        );

        if (distance > ATTENDANCE_CONFIG.MAX_RADIUS) {
          throw BaseError.badRequest("You are outside office area");
        }

        const created = await tx.attendance.create({
          data: {
            ...data,
            status,
          },
        });

        if (type === "CHECK_IN") {
          await tx.pointRecord.create({
            data: {
              attendanceId: created.id,
              point,
            },
          });
        }

        const result = await tx.attendance.findUnique({
          where: {
            id: created.id,
          },
          include: {
            users: true,
            pointRecord: true,
          },
        });

        return result;
      });
    } catch (error) {
      if (storedFilePath && fs.existsSync(storedFilePath)) {
        fs.unlinkSync(storedFilePath);
      }

      throw error;
    }
  }

  async today(employeeId) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const records = await this.prisma.attendance.findMany({
      where: {
        employeeId,
        datetime_log: {
          gte: start,
          lt: end,
        },
      },
      include: {
        pointRecord: true,
      },
    });

    const checkIn = records.find((r) => r.type === "CHECK_IN") || null;
    const checkOut = records.find((r) => r.type === "CHECK_OUT") || null;

    return {
      checkIn,
      checkOut,
      canCheckIn: !checkIn,
      canCheckOut: !!checkIn && !checkOut,
      completed: !!checkIn && !!checkOut,
    };
  }

  async list({ query } = {}) {
    const options = buildQueryOptions(attendanceQueryConfig, query);

    if (query?.search) {
      const rawSearch = query.search.toLowerCase();

      const orConditions = [
        {
          users: {
            is: {
              full_name: {
                contains: rawSearch,
                mode: "insensitive",
              },
            },
          },
        },
      ];

      if ("check in".includes(rawSearch)) {
        orConditions.push({
          type: "CHECK_IN",
        });
      }

      if ("check out".includes(rawSearch)) {
        orConditions.push({
          type: "CHECK_OUT",
        });
      }

      if ("late".includes(rawSearch)) {
        orConditions.push({
          status: "LATE",
        });
      }

      if ("early".includes(rawSearch)) {
        orConditions.push({
          status: "EARLY",
        });
      }

      if ("on_time".includes(rawSearch)) {
        orConditions.push({
          status: "ON_TIME",
        });
      }

      if ("pending".includes(rawSearch)) {
        orConditions.push({
          status: "PENDING",
        });
      }

      options.where = {
        OR: orConditions,
      };
    }

    const [data, count] = await Promise.all([
      this.prisma.attendance.findMany({
        ...options,
        include: {
          users: true,
          pointRecord: true,
        },
      }),

      this.prisma.attendance.count({
        where: options.where,
      }),
    ]);

    return { data, count };
  }

  async detail(id) {
    const data = await this.prisma.attendance.findUnique({
      where: { id },
      include: {
        users: true,
        pointRecord: true,
      },
    });

    if (!data) throw BaseError.notFound("Attendance not found");

    return data;
  }

  async remove(currentUser, id) {
    return this.prisma.$transaction(async (tx) => {
      if (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN") {
        throw BaseError.forbidden("You are not allowed to delete attendance");
      }

      const current = await tx.attendance.findUnique({
        where: { id },
      });

      if (!current) {
        throw BaseError.notFound("Attendance not found");
      }

      await tx.attendance.delete({
        where: { id },
      });

      return {
        message: "Attendance deleted successfully",
      };
    });
  }

  async getConfig() {
    return {
      officeLatitude: ATTENDANCE_CONFIG.OFFICE_LAT,
      officeLongitude: ATTENDANCE_CONFIG.OFFICE_LNG,
      radius: ATTENDANCE_CONFIG.MAX_RADIUS,
    };
  }
}

export default new AttendanceService();
