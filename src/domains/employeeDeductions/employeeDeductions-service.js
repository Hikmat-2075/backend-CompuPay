import BaseError from "../../base_classes/base-error.js";
import { PrismaService } from "../../common/services/prisma.service.js";
import { buildQueryOptions } from "../../utils/buildQueryOptions.js";
import employeeDeductionsQueryConfig from "./employeeDeductions-query-config.js";
import Joi from "joi";

class EmployeeDeductionsService {
    constructor(){
        this.prisma = new PrismaService();
    }

    async create(currentUser, data) {
        let validation = "";
        const stack = [];
        const fail = (msg, path) => {
            validation += (validation ? " " : "") + msg;
            stack.push({ message: msg, path: [path] });
        };

        if (currentUser.role !== "ADMIN") {
            fail("Forbidden, only ADMIN is allowed to create Employee Deduction", "role");
            throw new Joi.ValidationError(validation, stack);
        }

        return this.prisma.$transaction(async (tx) => {

            // Cek employee
            const employee = await tx.user.findUnique({
                where: { id: data.employeeId }
            });
            if (!employee) {
                fail("Employee not found", "employeeId");
                throw new Joi.ValidationError(validation, stack);
            }

            // Cek deduction
            const deduction = await tx.deductions.findUnique({
                where: { id: data.deductionId }
            });
            if (!deduction) {
                fail("Deduction not found", "deductionId");
                throw new Joi.ValidationError(validation, stack);
            }

            // Cek duplicate
            const duplicate = await tx.employeeDeductions.findFirst({
                where: {
                    employeeId: data.employeeId,
                    deductionId: data.deductionId,
                    effective_date: data.effective_date
                }
            });
            if (duplicate) {
                fail(
                    "Employee already has this deduction on the same effective date",
                    "effective_date"
                );
                throw new Joi.ValidationError(validation, stack);
            }

            // Insert
            const created = await tx.employeeDeductions.create({ data });
            return created;
        });
    }

    async detail(id) {
        const employeeDeduction = await this.prisma.employeeDeductions.findUnique({
            where: { id },
            include: employeeDeductionsQueryConfig.relations
        });

        if (!employeeDeduction) {
            throw BaseError.notFound("Employee Deduction not found");
        }
        return employeeDeduction;
    }

    async list({ query } = {}) {
        const options = buildQueryOptions(employeeDeductionsQueryConfig, query);

        options.include = employeeDeductionsQueryConfig.relations;
        const [data, count] = await Promise.all([
            this.prisma.employeeDeductions.findMany(options),
            this.prisma.employeeDeductions.count({ where: options.where })
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
                    currentPage: Number(page),
                    itemsPerPage: Number(limit)
                }
                : null
        };
    }

    async update(currentUser, id, data) {
        let validation = "";
        const stack = [];
        const fail = (msg, path) => {
            validation += (validation ? " " : "") + msg;
            stack.push({ message: msg, path: [path] });
        };

        // Role restriction
        if (currentUser.role !== "ADMIN") {
            fail("Forbidden, only ADMIN is allowed to update Employee Deduction", "role");
            throw new Joi.ValidationError(validation, stack);
        }

        // Joi schema validation
        const { error } = employeeDeductionsUpdateSchema.validate(data, { abortEarly: false });
        if (error) throw error;

        return this.prisma.$transaction(async (tx) => {
            const current = await tx.employeeDeductions.findUnique({ where: { id } });
            if (!current) throw BaseError.notFound("Employee Deduction not found");

            // ✔ Validasi userId (employee) jika diganti
            if (data.userId) {
                const employee = await tx.user.findUnique({
                    where: { id: data.userId }
                });
                if (!employee) {
                    fail("Employee not found", "userId");
                    throw new Joi.ValidationError(validation, stack);
                }
            }

            // ✔ Validasi deductionId jika diganti
            if (data.deductionId) {
                const deduction = await tx.deductions.findUnique({
                    where: { id: data.deductionId }
                });
                if (!deduction) {
                    fail("Deduction not found", "deductionId");
                    throw new Joi.ValidationError(validation, stack);
                }
            }

            // 🚫 Cek duplicate (userId + deductionId + type)
            if (data.type || data.deductionId || data.userId) {
                const duplicate = await tx.employeeDeductions.findFirst({
                    where: {
                        userId: data.userId ?? current.userId,
                        deductionId: data.deductionId ?? current.deductionId,
                        type: data.type ?? current.type,
                        id: { not: id }
                    }
                });

                if (duplicate) {
                    fail("This deduction with the same type already exists for this employee", "duplicate");
                    throw new Joi.ValidationError(validation, stack);
                }
            }

            const updated = await tx.employeeDeductions.update({
                where: { id },
                data
            });

            return updated;
        });
    }


    async remove(id) {
        return this.prisma.$transaction(async (tx) => {
            const current = await tx.employeeDeductions.findUnique({
                where: { id }
            });

            if (!current) {
                throw BaseError.notFound("Employee Deduction not found");
            }

            // Cek apakah sudah dipakai di payroll item (jika ada relasi)
            const inUse = await tx.payrollItem.findFirst({
                where: { deductionId: id }  // sesuaikan field jika berbeda
            });

            if (inUse) {
                throw BaseError.badRequest(
                    "This deduction cannot be deleted because it is already used in payroll."
                );
            }

            const deleted = await tx.employeeDeductions.delete({
                where: { id }
            });

            return {
                message: "Employee Deduction deleted successfully",
                //data: deleted
            };
        });
    }
}

export default new EmployeeDeductionsService();
