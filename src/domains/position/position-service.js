import BaseError from "../../base_classes/base-error.js";
import { PrismaService } from "../../common/services/prisma.service.js";
import { buildQueryOptions } from "../../utils/buildQueryOptions.js";
import positionQueryConfig from "./position-query-config.js";



class PositionService {
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
            const positionExist = await tx.position.findFirst({
                where: {name: data.name}
            });

            if(positionExist) {
                fail("Position already exist", "name");
                throw new Joi.validation(validation, stack);
            }

            const department = await tx.position.findFirst({
                where: {id: data.departmentId}
            })

            if(!department) {
                fail("Department not Found")
            }

            const created = await tx.position.create({
                data
            });

            if(!created) {
                throw new Error("Failed to create Position")
            }

            return created;
        });
    }

    async detail(id) {
        const position = await this.prisma.position.findUnique({
            where: { id },
            include: positionQueryConfig.relations,
        });
        if (!position) {
            throw BaseError.notFound("Position not found");
        }
        return position;
    }

    async list({query} = {}) {
        const options = buildQueryOptions(positionQueryConfig, query);

        const [data, count] = await Promise.all([
            this.prisma.position.findMany(options),
            this.prisma.position.count({ where: options.where }),
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
            const current = await tx.position.findUnique({ where: {id}});
            if (!current) {
                throw BaseError.notFound("Position not found");
            }
            let validation = "";
            const stack = [];
            const fail = (message, path) => {
            validation += (validation ? " " : "") + message;
                stack.push({ message, path: [path] });
            };
            
            if (data.name) {
                const positionExist = await tx.position.findFirst({
                    where: {
                        name: data.name,
                        NOT: { id }
                    }
                });
            
                if (positionExist) {
                    fail("Position already exists", "name");
                    throw new Joi.ValidationError(validation, stack);
                }
            }

            const updated = await tx.position.update({
                where: { id },
                data,
            });
            return updated;
        })
    }

    async remove(id) {
        const deleted = await this.prisma.position.delete({ where: { id } });

        return {message: "Position deleted successfully", data: deleted};
    }
}

export default new PositionService();