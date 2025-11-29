import BaseError from "../../base_classes/base-error.js";
import { PrismaService } from "../../common/services/prisma.service.js";
import { buildQueryOptions } from "../../utils/buildQueryOptions.js";
import payrollItemQueryConfig from "./payrollItem-query-config.js";
import Joi from "joi";

class PayrollItemService {
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

            // Check payroll exist
            const payroll = await tx.payroll.findUnique({
            where: { id: data.payrollId }
            });
            if (!payroll) {
            fail("Payroll not found", "payrollId");
            throw new Joi.ValidationError(validation, stack);
            }

            // Check employee exist
            const employee = await tx.employee.findUnique({
            where: { id: data.employeeId }
            });
            if (!employee) {
            fail("Employee not found", "employeeId");
            throw new Joi.ValidationError(validation, stack);
            }

            // Check duplicate payroll item
            const duplicate = await tx.payrollItem.findFirst({
            where: { payrollId: data.payrollId, employeeId: data.employeeId }
            });
            if (duplicate) {
            fail("Employee already included in this payroll", "employeeId");
            throw new Joi.ValidationError(validation, stack);
            }

            // Salary base
            const salary = employee.salary ?? 0;

            // Get allowances & deductions automatically
            const empAllowances = await tx.employeeAllowances.findMany({
            where: { employeeId: employee.id }
            });
            const empDeductions = await tx.employeeDeductions.findMany({
            where: { employeeId: employee.id }
            });

            const allowance = empAllowances.reduce((t, a) => t + a.amount, 0);
            const deductions = empDeductions.reduce((t, d) => t + d.amount, 0);

            const net = salary + allowance - deductions;

            const created = await tx.payrollItem.create({
            data: {
                payrollId: data.payrollId,
                employeeId: data.employeeId,
                present: data.present ?? 0,
                absent: data.absent ?? 0,
                late: data.late ?? 0,
                salary,
                allowance_amount: allowance,
                deductions,
                net
            }
            });

            return created;
        });
    }




    async detail(id) {
        const payrollItem = await this.prisma.payrollItem.findUnique({
            where: { id },
            include: payrollItemQueryConfig.relations
        });

        if (!payrollItem) {
            throw BaseError.notFound("Payroll Item not found");
        }

        return payrollItem;
    }

    async list({ query } = {}) {
        const options = buildQueryOptions(payrollItemQueryConfig, query);
        options.include = payrollItemQueryConfig.relations;
        const [data, count] = await Promise.all([
            this.prisma.payrollItem.findMany(options),
            this.prisma.payrollItem.count({ where: options.where })
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

    async update(id, data) {
        return this.prisma.$transaction(async (tx) => {
            const current = await tx.payrollItem.findUnique({
                where: { id }
            });

            if (!current) {
                throw BaseError.notFound("Payroll Item not found");
            }

            const updated = await tx.payrollItem.update({
                where: { id },
                data
            });

            return updated;
        });
    }

    async remove(id) {
        return this.prisma.$transaction(async (tx) => {
            const current = await tx.payrollItem.findUnique({
                where: { id }
            });

            if (!current) {
                throw BaseError.notFound("Payroll Item not found");
            }

            // Optional: block delete if payroll already approved / locked
            const payroll = await tx.payroll.findUnique({
                where: { id: current.payrollId }
            });
            if (payroll?.status === "APPROVED" || payroll?.status === "LOCKED") {
                throw BaseError.badRequest(
                    "This payroll item cannot be deleted because the payroll has been locked/approved"
                );
            }

            const deleted = await tx.payrollItem.delete({
                where: { id }
            });

            return {
                message: "Payroll Item deleted successfully",
                data: deleted
            };
        });
    }
}

export default new PayrollItemService();
