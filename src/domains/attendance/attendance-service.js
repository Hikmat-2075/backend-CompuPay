import fs from "fs";
import path from "path";
import BaseError from "../../base_classes/base-error.js";
import { PrismaService } from "../../common/services/prisma.service.js";
import attendanceQueryConfig from "./attendance-query-config.js";
import { buildQueryOptions } from "../../utils/buildQueryOptions.js";
import { getDistance } from "../../utils/geo.js";

class AttendanceService {
    constructor() {
        this.prisma = new PrismaService();
    }

    async create(data, file) {
        return this.prisma.$transaction(async (tx) => {

            if (file) {
                const uploadDir = path.join(process.cwd(), "public/assets/attendance");

                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                const filename = Date.now() + "-" + file.originalname;
                const filepath = path.join(uploadDir, filename);

                fs.writeFileSync(filepath, file.buffer);

                data.photo_url = `assets/attendance/${filename}`;
            }

           //const now = new Date();

            // override input
            //data.datetime_log = now;

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

            const startDay = new Date(now);
            startDay.setHours(0, 0, 0, 0);

            const endDay = new Date(now);
            endDay.setHours(23, 59, 59, 999);

            const today = await tx.attendance.findMany({
                where: {
                    employeeId: data.employeeId,
                    datetime_log: {
                        gte: startDay,
                        lt: endDay
                    }
                }
            });

            if (data.type === "CHECK_IN") {
                if (today.find(a => a.type === "CHECK_IN")) {
                    throw BaseError.badRequest("Already check-in today");
                }
            }

            if (data.type === "CHECK_OUT") {
                if (!today.find(a => a.type === "CHECK_IN")) {
                    throw BaseError.badRequest("Must check-in first");
                }
                if (today.find(a => a.type === "CHECK_OUT")) {
                    throw BaseError.badRequest("Already check-out today");
                }
            }

            const utcDate = new Date(data.datetime_log);

            const parts = new Intl.DateTimeFormat("en-GB", {
                timeZone: "Asia/Jakarta",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
            }).formatToParts(utcDate);

            const hour = Number(parts.find(p => p.type === "hour").value);
            const minutes = Number(parts.find(p => p.type === "minute").value);

            const totalMinutes = hour * 60 + minutes;

            const batasMasuk = 9 * 60;     // 09:00
            const batasPulang = 17 * 60;   // 17:00

            let status = "ON_TIME";

            if (data.type === "CHECK_IN" && totalMinutes > batasMasuk) {
                status = "LATE";
            }

            if (data.type === "CHECK_OUT" && totalMinutes < batasPulang) {
                status = "EARLY";
            }

            data.latitude = Number(data.latitude);
            data.longitude = Number(data.longitude);
            data.accuracy = data.accuracy ? Number(data.accuracy) : null;

            if (
                data.accuracy === null ||
                isNaN(data.accuracy)
            ) {
                throw BaseError.badRequest(
                    "Invalid GPS accuracy"
                );
            }

            if (data.accuracy > 5) {
                throw BaseError.badRequest(
                    "GPS accuracy too low"
                );
            }
            if (isNaN(data.latitude) || isNaN(data.longitude)) {
                throw BaseError.badRequest("Invalid coordinates");
            }

            const OFFICE_LAT = -6.2;
            const OFFICE_LNG = 106.8;
            const MAX_RADIUS = 100; 

            const distance = getDistance(
                OFFICE_LAT,
                OFFICE_LNG,
                data.latitude,
                data.longitude
            );

            if (distance > MAX_RADIUS) {
                throw BaseError.badRequest("You are outside office area");
            }

            const created = await tx.attendance.create({
                data: {
                    ...data,
                    status
                }
            });

            return created;
        });
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
                    lt: end
                }
            }
        });

        return {
            checkIn: records.find(r => r.type === "CHECK_IN"),
            checkOut: records.find(r => r.type === "CHECK_OUT")
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

            // partial enum detection
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
            where: { id }
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
    });
}
}

export default new AttendanceService();