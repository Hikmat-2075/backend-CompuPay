import BaseError from "../../base_classes/base-error.js";
import { PrismaService } from "../../common/services/prisma.service.js";
import { buildQueryOptions } from "../../utils/buildQueryOptions.js";
import userQueryConfig from "./user-query-config.js";
import Joi from "joi"

class UserService {
    constructor() {
        this.prisma = new PrismaService
    }

    async create(currentUser, data) {
        if (currentUser.role !== "ADMIN") {
            throw BaseError.forbidden(
                "You do not have permission to create an admin"
            );
        }

        let validation = "";
        const stack = [];
        const fail = (msg, path) => {
            validation += (validation ? " " : "") + msg;
            stack.push({ message: msg, path: [path] });
        };

        return this.prisma.$transaction(async (tx) => {
            // Cek email sudah dipakai atau belum
            const emailExist = await tx.user.findFirst({
                where: { email: data.email }
            });

            if (emailExist) {
                fail("Email already exists", "email");
                throw new Joi.ValidationError(validation, stack);
            }

            const created = await tx.user.create({
                data
            });

            if (!created) {
                throw new Error("Failed to create user");
            }

            return created;
        });
    }

    async detail(id) {
        const user = await this.prisma.user.findUnique({
            where: { id }
        });
        if (!user){
            throw BaseError.notFound("User not found");
        }
        return user;
    }

    async list({ query } = {}) {
        const options = buildQueryOptions(userQueryConfig, query);

        const [data, count] = await Promise.all([
            this.prisma.user.findMany(options),
            this.prisma.user.count({ where: options.where }),
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
            itemsPerPage: Number(limit),
        }
            : null,
        };
    }

    async update(currentUser, id, data) {
        return this.prisma.$transaction(async (tx) => {
            const current = await tx.user.findUnique({ where: { id } });
            if (!current) throw BaseError.notFound("User not found");

            let validation = "";
            const stack = [];
            const fail = (message, path) => {
                validation += (validation ? " " : "") + message;
                stack.push({ message, path: [path] });
            };

            // Cek email hanya jika memang ada email dalam request
            if (data.email) {
                const emailExist = await tx.user.findFirst({
                    where: {
                        email: data.email,
                        NOT: { id }
                    }
                });

                if (emailExist) {
                    fail("Email already exists", "email");
                    throw new Joi.ValidationError(validation, stack);
                }
            }

            const updated = await tx.user.update({
                where: { id },
                data,
            });

            return updated;
        });
    }


    async remove(id) {
        const deleted = await this.prisma.user.delete({ where: { id } });
        // Jika tanpa middleware, ganti ke update:
        // const deleted = await this.prisma.branch.update({ where: { id }, data: { deleted_at: new Date() } });
        return { message: "User deleted successfully", data: deleted};
    }
}

export default new UserService();