import BaseError from "../../base_classes/base-error.js";
import { PrismaService } from "../../common/services/prisma.service.js";
import { buildQueryOptions } from "../../utils/buildQueryOptions.js";
import allowancesQueryConfig from "./allowances-query-config.js";
import Joi from "joi";


class AllowancesService {
    constructor(){
        this.prisma = new PrismaService
    }
    async create(currentUser, data) {
        let validation = "";
        const stack = [];
        const fail = (msg, path) => {
            validation += (validation ? " " : "") + msg;
            stack.push({message: msg, path: [path]});
        };
        return this.prisma.$transaction(async (tx) => {
            const allowancesExist = await tx.allowances.findFirst({
                where: {allowance: data.allowance}
            });

            if(allowancesExist) {
                fail("Allowances already exist", "allowances");
                throw new Joi.validation(validation, stack);
            }

            const created = await tx.allowances.create({
                data
            });

            if(!created) {
                throw new Error("Failed to create Allowances")
            }

            return created;
        });
    }

    async detail(id) {
        const allowances = await this.prisma.allowances.findUnique({
            where: { id },
            include: allowancesQueryConfig.relations,
        });
        if (!allowances) {
            throw BaseError.notFound("Allowances not found");
        }
        return allowances;
    }

    async list({query} = {}) {
        const options = buildQueryOptions(allowancesQueryConfig, query);

        options.include = allowancesQueryConfig.relations;
        
        const [data, count] = await Promise.all([
            this.prisma.allowances.findMany(options),
            this.prisma.allowances.count({ where: options.where }),
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
            const current = await tx.allowances.findUnique({ where: {id}});
            if (!current) {
                throw BaseError.notFound("Allowances not found");
            }
            let validation = "";
            const stack = [];
            const fail = (message, path) => {
            validation += (validation ? " " : "") + message;
                stack.push({ message, path: [path] });
            };
            
            if (data.allowance) {
                const allowancesExist = await tx.allowances.findFirst({
                    where: {
                        allowance: data.allowance,
                        NOT: { id }
                    }
                });
            
                if (allowancesExist) {
                    fail("Allowances already exists", "allowance");
                    throw new Joi.ValidationError(validation, stack);
                }
            }

            const updated = await tx.allowances.update({
                where: { id },
                data,
            });
            return updated;
        })
    }

    async remove(id) {
        const current = await this.prisma.allowances.findUnique({
            where: { id }
        });

        if (!current) {
            throw BaseError.notFound("Allowances not found");
        }

        const deleted = await this.prisma.allowances.delete({
            where: { id }
        });

        return {
            message: "Allowances deleted successfully"
            // optional: data: deleted
        };
    }
}

export default new AllowancesService();