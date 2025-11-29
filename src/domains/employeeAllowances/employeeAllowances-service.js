import BaseError from "../../base_classes/base-error.js";
import { PrismaService } from "../../common/services/prisma.service.js";
import { buildQueryOptions } from "../../utils/buildQueryOptions.js";
import employeeAllowancesQueryConfig from "./employeeAllowances-query-config.js";
import Joi from "joi";

class EmployeeAllowancesService {
    constructor() {
        this.prisma = new PrismaService();
    }

    async create(data) {
        let validation = "";
        const stack = [];
        const fail = (msg, path) => {
            validation += (validation ? " " : "") + msg;
            stack.push({ message: msg, path: [path] });
        };

        return this.prisma.$transaction(async (tx) => {

            // Check employee exists
            const employee = await tx.employee.findUnique({
                where: { id: data.employeeId }
            });
            if (!employee) {
                fail("Employee not found", "employeeId");
                throw new Joi.ValidationError(validation, stack);
            }

            // Check allowance exists
            const allowance = await tx.allowances.findUnique({
                where: { id: data.allowanceId }
            });
            if (!allowance) {
                fail("Allowance not found", "allowanceId");
                throw new Joi.ValidationError(validation, stack);
            }

            // Optional business rule:
            // Prevent duplicate allowance type at same effective date
            const duplicate = await tx.employeeAllowances.findFirst({
                where: {
                    employeeId: data.employeeId,
                    allowanceId: data.allowanceId,
                    effective_date: data.effective_date
                }
            });

            if (duplicate) {
                fail("Employee already has this allowance on the same effective date", "effective_date");
                throw new Joi.ValidationError(validation, stack);
            }

            const created = await tx.employeeAllowances.create({ data });
            return created;
        });
    }


    async detail(id) {
        const employeeAllowance = await this.prisma.employeeAllowances.findUnique({
            where: { id },
            include: employeeAllowancesQueryConfig.relations
        });

        if (!employeeAllowance) {
            throw BaseError.notFound("Employee Allowance not found");
        }

        return employeeAllowance;
    }


    async list({ query } = {}) {
        const options = buildQueryOptions(employeeAllowancesQueryConfig, query);

        options.include = employeeAllowancesQueryConfig.relations;
        const [data, count] = await Promise.all([
            this.prisma.employeeAllowances.findMany(options),
            this.prisma.employeeAllowances.count({ where: options.where })
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
                    itemsPerPage: Number(limit)
                }
                : null
        };
    }


    async update(id, data) {
        return this.prisma.$transaction(async (tx) => {
            const current = await tx.employeeAllowances.findUnique({
                where: { id }
            });

            if (!current) {
                throw BaseError.notFound("Employee Allowance not found");
            }

            const updated = await tx.employeeAllowances.update({
                where: { id },
                data
            });

            return updated;
        });
    }


    async remove(id) {
        return this.prisma.$transaction(async (tx) => {
            // Cek apakah allowance ada
            const current = await tx.employeeAllowances.findUnique({
                where: { id }
            });

            if (!current) {
                throw BaseError.notFound("Employee Allowance not found");
            }

            // Cek apakah dipakai di payroll item (jika ada relasi)
            const inUse = await tx.payrollItem.findFirst({
                where: { allowanceId: id } // sesuaikan jika field berbeda
            });

            if (inUse) {
                throw BaseError.badRequest(
                    "This allowance cannot be deleted because it is already used in payroll."
                );
            }

            // Hapus
            const deleted = await tx.employeeAllowances.delete({
                where: { id }
            });

            return {
                message: "Employee Allowance deleted successfully",
                //data: deleted
            };
        });
    }
}

export default new EmployeeAllowancesService();
