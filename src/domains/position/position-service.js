import BaseError from "../../base_classes/base-error.js";
import { PrismaService } from "../../common/services/prisma.service.js";
import { buildQueryOptions } from "../../utils/buildQueryOptions.js";
import positionQueryConfig from "./position-query-config.js";
import Joi from "joi";

class PositionService {
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
            const positionExist = await tx.position.findFirst({
                where: { name: data.name }
            });

            if (positionExist) {
                fail("Position already exist", "name");
                throw new Joi.ValidationError(validation, stack);
            }

            const department = await tx.department.findFirst({
                where: { id: data.departmentId }
            });

            if (!department) {
                fail("Department not Found", "departmentId");
                throw new Joi.ValidationError(validation, stack);
            }

            const { levels = [], ...positionData } = data;

            const created = await tx.position.create({
                data: {
                    ...positionData,
                    levels: {
                        create: levels.map((lv) => ({ name: lv.name }))
                    }
                },
                include: positionQueryConfig.relations
            });

            return created;
        });
    }

    async detail(id) {
        const position = await this.prisma.position.findUnique({
            where: { id },
            include: {
                department: true,
                _count: {
                    select: { employees: true },
                },
                levels: true,
            },
        });

        if (!position) {
            throw BaseError.notFound("Position not found");
        }

        return position;
    }


    async list({ query } = {}) {
        const options = buildQueryOptions(positionQueryConfig, query);

        options.include = {
            ...options.include,
            department: true,
            _count: { select: { employees: true } },
            levels: true,
        };

        const [data, count] = await Promise.all([
            this.prisma.position.findMany(options),
            this.prisma.position.count({ where: options.where }),
        ]);

        const page = query?.pagination?.page ?? 1;
        const limit = query?.pagination?.limit ?? 10;
        const hasPagination = !!(query?.pagination && !query?.get_all);
        const totalPages = hasPagination ? Math.ceil(count / limit) : 1;
        const mappedData = data.map((item) => ({
            ...item,
            totalEmployees: item._count.employee,
        }));

        return {
            data: mappedData,
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
            const current = await tx.position.findUnique({ where: { id } });
            if (!current) {
                throw BaseError.notFound("Position not found");
            }

            let validation = "";
            const stack = [];
            const fail = (msg, path) => {
                validation += (validation ? " " : "") + msg;
                stack.push({ message: msg, path: [path] });
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

            const { levels, ...positionData } = data;

            const updated = await tx.position.update({
                where: { id },
                data: positionData,
            });

            // jika user submit levels baru, replace semuanya
            if (Array.isArray(levels)) {
                await tx.positionLevel.deleteMany({ where: { positionId: id } });

                if (levels.length > 0) {
                    await tx.positionLevel.createMany({
                        data: levels.map(lv => ({
                            positionId: id,
                            name: lv.name
                        }))
                    });
                }
            }

            return this.detail(id);
        });
    }

    async remove(id) {
        return this.prisma.$transaction(async (tx) => {
            await tx.positionLevel.deleteMany({ where: { positionId: id } });
            const deleted = await tx.position.delete({ where: { id } });

            return {
                message: "Position deleted successfully",
                data: deleted
            };
        });
    }
}

export default new PositionService();
