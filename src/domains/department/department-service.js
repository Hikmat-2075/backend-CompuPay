import BaseError from "../../base_classes/base-error.js";
import { PrismaService } from "../../common/services/prisma.service.js";
import { buildQueryOptions } from "../../utils/buildQueryOptions.js";
import departmentQueryConfig from "./department-query-config.js";
import Joi from "joi";

class DepartmentService {
    constructor(){
        this.prisma = new PrismaService
    }
    async create(currentUser, data) {
        if (!data) throw BaseError.badRequest("Request body is required");

        let validation = "";
        const stack = [];
        const fail = (msg, path) => {
            validation += (validation ? " " : "") + msg;
            stack.push({ message: msg, path: [path] });
        };

        if (currentUser.role !== "ADMIN") {
            fail("Forbidden, only ADMIN is allowed to create Department", "role");
            throw new Joi.ValidationError(validation, stack);
        }

        return this.prisma.$transaction(async (tx) => {
            const departmentExist = await tx.department.findFirst({
                where: { name: data.name }
            });

            if (departmentExist) {
                fail("Department already exist", "name");
                throw BaseError.badRequest(validation, stack);
            }

            const created = await tx.department.create({ data });

            return created;
        });
    }

    async detail(id) {
        const department = await this.prisma.department.findUnique({
            where: { id },
            include: departmentQueryConfig.relations,
        });
        if (!department) {
            throw BaseError.notFound("Department not found");
        }
        return department;
    }

    async list({query} = {}) {
        const options = buildQueryOptions(departmentQueryConfig, query);

        options.include = departmentQueryConfig.relations;

        const [data, count] = await Promise.all([
            this.prisma.department.findMany(options),
            this.prisma.department.count({ where: options.where }),
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
            const current = await tx.department.findUnique({ where: {id}});
            if (!current) {
                throw BaseError.notFound("Department not found");
            }
            let validation = "";
            const stack = [];
            const fail = (message, path) => {
            validation += (validation ? " " : "") + message;
                stack.push({ message, path: [path] });
            };

            if (currentUser.role !== "ADMIN") {
                fail("Forbidden, only ADMIN is allowed to update Department", "role");
                throw new Joi.ValidationError(validation, stack);
            }
            
            if (data.name) {
                const departmentExist = await tx.department.findFirst({
                    where: {
                        name: data.name,
                        NOT: { id }
                    }
                });
            
                if (departmentExist) {
                    fail("Department already exists", "name");
                    throw new Joi.ValidationError(validation, stack);
                }
            }

            const updated = await tx.department.update({
                where: { id },
                data,
            });
            return updated;
        })
    }

async remove(id) {
    return this.prisma.$transaction(async (tx) => {
        const current = await this.prisma.department.findUnique({
            where: { id }
        });

        if (!current) {
            throw BaseError.notFound("Department not found");
        }
        // cek apakah department dipakai employee
        const employeeCount = await tx.employee.count({
            where: { departmentId: id }
        });

        if (employeeCount > 0) {
            throw BaseError.badRequest(
                "Cannot delete department because it is still assigned to employees"
            );
        }

        // cek apakah department dipakai position
        const positionCount = await tx.position.count({
            where: { departmentId: id }
        });

        if (positionCount > 0) {
            throw BaseError.badRequest(
                "Cannot delete department because it is still used in positions"
            );
        }

        //jika aman → hapus
        const deleted = await tx.department.delete({
            where: { id }
        });

        return {
            message: "Department deleted successfully",
            // data: deleted
        };
    });
}

}

export default new DepartmentService();