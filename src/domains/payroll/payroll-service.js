import BaseError from "../../base_classes/base-error.js";
import { PrismaService } from "../../common/services/prisma.service.js";
import { buildQueryOptions } from "../../utils/buildQueryOptions.js";
import payrollQueryConfig from "./payroll-query-config.js";
import Joi from "joi";import { hash } from "bcrypt";

class PayrollService {
    constructor() {
        this.prisma = new PrismaService();
    }

    async create(currentUser, data) {
        let validation = "";
        const stack = [];
        const fail = (msg, path) => {
            validation += (validation ? " " : "") + msg;
            stack.push({message: msg, path: [path]});
        };
        return this.prisma.$transaction(async (tx) => {
            const payrollExist = await tx.payroll.findFirst({
                where: {ref_no: data.ref_no}
            });

            if(payrollExist) {
                fail("Payroll with this reference number already exists", "ref_no");
                throw new Joi.validation(validation, stack);
            }

            const created = await tx.payroll.create({
                data
            });

            if(!created) {
                throw new Error("Failed to create Payroll")
            }

            return created;
        });
    }

    async detail(id) {
        const payroll = await this.prisma.payroll.findUnique({
            where: { id }
        });
        if (!payroll) {
            throw BaseError.notFound("Payroll not found");
        }
        return payroll;
    }

    async list({query} = {}) {
        const options = buildQueryOptions(payrollQueryConfig, query);
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
    
    async update(currentUser, id, data) {
        return this.prisma.$transaction(async (tx) => {
            const current = await tx.payroll.findUnique({ where: {id}});
            if (!current) {
                throw BaseError.notFound("Payroll not found");
            }
            let validation = "";
            const stack = [];
            const fail = (message, path) => {
            validation += (validation ? " " : "") + message;
                stack.push({ message, path: [path] });
            };
            
            if (data.payroll) {
                const payrollExist = await tx.payroll.findFirst({
                    where: {
                        payroll: data.payroll,
                        NOT: { id }
                    }
                });
            
                if (payrollExistExist) {
                    fail("Payroll already exists", "allowance");
                    throw new Joi.ValidationError(validation, stack);
                }
            }

            const updated = await tx.payroll.update({
                where: { id },
                data,
            });
            return updated;
        })
    }

    async remove(id) {
        const deleted = await this.prisma.payroll.delete({ where: { id } });

        return {message: "Payroll deleted successfully", data: deleted};
    }
}
export default new PayrollService();