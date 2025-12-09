
import BaseError from "../../base_classes/base-error.js";
import { PrismaService } from "../../common/services/prisma.service.js";
import { buildQueryOptions } from "../../utils/buildQueryOptions.js";
import employeeQueryConfig from "./employee-query-config.js";
import path from "path";
import fs from "fs";

import Joi from "joi";
class EmployeeService {
    constructor(){
        this.prisma = new PrismaService
    }
    async create(data) {
        let validation = "";
        const stack = [];
        const fail = (msg, path) => {
            validation += (validation ? " " : "") + msg;
            stack.push({ message: msg, path: [path] });
        };

        return this.prisma.$transaction(async (tx) => {
            // Cek employee_number duplicate
            const employeeNumberExist = await tx.user.findFirst({
                where: { employee_number: data.employee_number },
            });

            if (employeeNumberExist) {
                fail("Employee number already exists", "employee_number");
                throw new Joi.ValidationError(validation, stack);
            }

            // Cek email duplicate
            const emailExist = await tx.user.findFirst({
                where: { email: data.email },
            });

            if (emailExist) {
                fail("Email already exists", "email");
                throw new Joi.ValidationError(validation, stack);
            }

            // Pastikan department valid
            const department = await tx.department.findUnique({
                where: { id: data.departmentId },
            });

            if (!department) {
                fail("Department not found", "departmentId");
                throw new Joi.ValidationError(validation, stack);
            }

            // Pastikan position valid
            const position = await tx.position.findUnique({
                where: { id: data.positionId },
            });

            if (!position) {
                fail("Position not found", "positionId");
                throw new Joi.ValidationError(validation, stack);
            }

            const created = await tx.user.create({
                data: {
                    ...data,
                    role: "USER",
                },
            });

            if (!created) throw new Error("Failed to create Employee");

            return created;
        });
    }

    async detail(id) {
        const employee = await this.prisma.user.findUnique({
            where: { id },
            include: employeeQueryConfig.relations,
        });

        if (!employee) throw BaseError.notFound("Employee not found");

        return employee;
    }

    async list({ query } = {}) {
        const options = buildQueryOptions(employeeQueryConfig, query);

        options.include = employeeQueryConfig.relations;

        const [data, count] = await Promise.all([
            this.prisma.user.findMany(options),
            this.prisma.user.count({ where: options.where }),
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

    async update(id, data, file) {
        return this.prisma.$transaction(async (tx) => {
            const current = await tx.user.findUnique({ where: { id } });
            if (!current) throw BaseError.notFound("Employee not found");

            let validation = "";
            const stack = [];
            const fail = (msg, path) => {
                validation += (validation ? " " : "") + msg;
                stack.push({ message: msg, path: [path] });
            };

            // Cek duplicate employee_number
            if (data.employee_number) {
                const exist = await tx.user.findFirst({
                    where: { employee_number: data.employee_number, NOT: { id } }
                });
                if (exist) {
                    fail("Employee number already exists", "employee_number");
                    throw new Joi.ValidationError(validation, stack);
                }
            }

            // Cek duplicate email
            if (data.email) {
                const emailExist = await tx.user.findFirst({
                    where: { email: data.email, NOT: { id } }
                });
                if (emailExist) {
                    fail("Email already exists", "email");
                    throw new Joi.ValidationError(validation, stack);
                }
            }

            // Validasi department jika update
            if (data.departmentId) {
                const dep = await tx.department.findUnique({ where: { id: data.departmentId } });
                if (!dep) {
                    fail("Department not found", "departmentId");
                    throw new Joi.ValidationError(validation, stack);
                }
            }

            // Validasi position jika update
            if (data.positionId) {
                const pos = await tx.position.findUnique({ where: { id: data.positionId } });
                if (!pos) {
                    fail("Position not found", "positionId");
                    throw new Joi.ValidationError(validation, stack);
                }
            }

            if (file) {
                const uploadsDir = path.join(process.cwd(), "public/assets/images");
                if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

                const filename = Date.now() + "-" + file.originalname;
                const filepath = path.join(uploadsDir, filename);

                // simpan file ke folder
                fs.writeFileSync(filepath, file.buffer);

                // hapus file lama jika ada
                if (current.profile_uri) {
                    const oldPath = path.join(process.cwd(), "public", current.profile_uri);
                    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                }

                // simpan path ke database (tanpa /public agar bisa diakses via static express)
                data.profile_uri = `assets/images/${filename}`;
            }

            const updated = await tx.user.update({
            where: { id },
            data
            });

            return updated;
        });
    }

    async remove(id) {
        const deleted = await this.prisma.user.delete({
            where: { id },
        });

        return {
            message: "Employee deleted successfully",
            data: deleted,
        };
    }
}

export default new EmployeeService();