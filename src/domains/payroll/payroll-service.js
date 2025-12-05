import BaseError from "../../base_classes/base-error.js";
import { PrismaService } from "../../common/services/prisma.service.js";
import { buildQueryOptions } from "../../utils/buildQueryOptions.js";
import payrollQueryConfig from "./payroll-query-config.js";
import Joi from "joi";

class PayrollService {
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
            const payrollExist = await tx.payroll.findFirst({
                where: { ref_no: data.ref_no }
            });

            if (payrollExist) {
                fail("Reference number already exists", "ref_no");
                throw new Joi.ValidationError(validation, stack);
            }

            const { items, ...payrollData } = data;

            if (!items || items.length === 0) {
                fail("Payroll must contain at least one payroll item", "items");
                throw new Joi.ValidationError(validation, stack);
            }
            const createdPayroll = await tx.payroll.create({
                data: payrollData
            });
            if (!createdPayroll) throw new Error("Failed to create Payroll");

            const itemsData = items.map((item) => ({
                ...item,
                payrollId: createdPayroll.id
            }));

            await tx.payrollItem.createMany({
                data: itemsData
            });

            return await tx.payroll.findUnique({
                where: { id: createdPayroll.id },
                include: payrollQueryConfig.relations
            });
        });
    }

    async detail(id) {
        const payroll = await this.prisma.payroll.findUnique({
            where: { id },
            include: payrollQueryConfig.relations,
        });

        if (!payroll) throw BaseError.notFound("Payroll not found");

        return payroll;
    }

    async list({ query } = {}) {
        const options = buildQueryOptions(payrollQueryConfig, query);
        options.include = payrollQueryConfig.relations;
        const [data, count] = await Promise.all([
            this.prisma.payroll.findMany(options),
            this.prisma.payroll.count({ where: options.where }),
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

    async update(id, data) {
        return this.prisma.$transaction(async (tx) => {
            const current = await tx.payroll.findUnique({ where: { id } });
            if (!current) throw BaseError.notFound("Payroll not found");

            let validation = "";
            const stack = [];
            const fail = (msg, path) => {
                validation += (validation ? " " : "") + msg;
                stack.push({ message: msg, path: [path] });
            };

            // cek ref_no duplicate
            if (data.ref_no) {
                const refExist = await tx.payroll.findFirst({
                    where: { ref_no: data.ref_no, NOT: { id } }
                });

                if (refExist) {
                    fail("Reference number already exists", "ref_no");
                    throw new Joi.ValidationError(validation, stack);
                }
            }

            const { items, ...payrollData } = data;

            // 1. Update payroll fields
            const updated = await tx.payroll.update({
                where: { id },
                data: payrollData
            });

            // 2. Jika ada items dikirim, replace semua item
            if (items) {
                await tx.payrollItem.deleteMany({ where: { payrollId: id } });
                const newItems = items.map((item) => ({ ...item, payrollId: id }));
                await tx.payrollItem.createMany({ data: newItems });
            }

            // 3. return hasil lengkap
            return await tx.payroll.findUnique({
                where: { id },
                include: payrollQueryConfig.relations
            });
        });
    }


    async remove(id) {
        return this.prisma.$transaction(async (tx) => {
            const payroll = await tx.payroll.findUnique({
                where: { id }
            });

            if (!payroll) {
                throw BaseError.notFound("Payroll not found");
            }

            // hanya payroll berstatus DRAFT yang boleh dihapus
            if (payroll.status !== "PENDING") {
                throw BaseError.badRequest(
                    "Only payroll with DRAFT status can be deleted"
                );
            }

            // hapus payroll item dulu
            await tx.payrollItem.deleteMany({
                where: { payrollId: id }
            });

            // baru hapus payroll
            await tx.payroll.delete({
                where: { id }
            });

            return {
                message: "Payroll deleted successfully"
            };
        });
    }

}

export default new PayrollService();
