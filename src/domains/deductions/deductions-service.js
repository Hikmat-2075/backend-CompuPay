import BaseError from "../../base_classes/base-error.js";
import { PrismaService } from "../../common/services/prisma.service.js";
import { buildQueryOptions } from "../../utils/buildQueryOptions.js";
import deductionsQueryConfig from "./deductions-query-config.js";
import Joi from "joi";

class DeductionsService {
    constructor(){
        this.prisma = new PrismaService
    }
    async create(data) {
        let validation = "";
        const stack = [];
        const fail = (msg, path) => {
            validation += (validation ? " " : "") + msg;
            stack.push({message: msg, path: [path]});
        };
        return this.prisma.$transaction(async (tx) => {
            const deductionExist = await tx.deductions.findFirst({
                where: {deduction: data.deduction}
            });

            if(deductionExist) {
                fail("Deduction already exist", "deduction");
                throw new Joi.validation(validation, stack);
            }

            const created = await tx.deductions.create({
                data
            });

            if(!created) {
                throw new Error("Failed to create Deduction")
            }

            return created;
        });
    }

    async detail(id) {
        const deduction = await this.prisma.deductions.findUnique({
            where: { id },
            include: deductionsQueryConfig.relations,
        });
        if (!deduction) {
            throw BaseError.notFound("Deduction not found");
        }
        return deduction;
    }

    async list({query} = {}) {
        const options = buildQueryOptions(deductionsQueryConfig, query);

        const [data, count] = await Promise.all([
            this.prisma.deductions.findMany(options),
            this.prisma.deductions.count({ where: options.where }),
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
            const current = await tx.deductions.findUnique({ where: {id}});
            if (!current) {
                throw BaseError.notFound("Deduction not found");
            }
            let validation = "";
            const stack = [];
            const fail = (message, path) => {
            validation += (validation ? " " : "") + message;
                stack.push({ message, path: [path] });
            };
            
            if (data.deduction) {
                const deductionExist = await tx.deductions.findFirst({
                    where: {
                        deduction: data.deduction,
                        NOT: { id }
                    }
                });
            
                if (deductionExist) {
                    fail("Deduction already exists", "deduction");
                    throw new Joi.ValidationError(validation, stack);
                }
            }

            const updated = await tx.deductions.update({
                where: { id },
                data,
            });
            return updated;
        })
    }

    async remove(id) {
        const current = await this.prisma.deductions.findUnique({
            where: { id }
        });

        if (!current) {
            throw BaseError.notFound("Deduction not found");
        }

        const deleted = await this.prisma.deductions.delete({
            where: { id }
        });

        return {
            message: "Deduction deleted successfully"
            // optional: data: deleted
        };
    }

}

export default new DeductionsService();