import BaseError from "../../base_classes/base-error.js";
import { PrismaService } from "../../common/services/prisma.service.js";

class LeaverequestService {
    constructor() {
        this.prisma = new PrismaService();
    }

    isAdmin(currentUser) {
        return currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN";
    }

    async create(currentUser, data) {
        if (!data) {
            throw BaseError.badRequest("Request body is required");
        }

        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);

        if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
            throw BaseError.badRequest("Invalid startDate or endDate");
        }

        if (endDate < startDate) {
            throw BaseError.badRequest("endDate must be greater than or equal to startDate");
        }

        return this.prisma.$transaction(async (tx) => {
            const overlap = await tx.leaveRequest.findFirst({
                where: {
                    user_id: currentUser.id,
                    status: { in: ["PENDING", "APPROVED"] },
                    startDate: { lte: endDate },
                    endDate: { gte: startDate },
                },
            });

            if (overlap) {
                throw BaseError.badRequest("Date range overlaps with an existing leave request");
            }

            const created = await tx.leaveRequest.create({
                data: {
                    user_id: currentUser.id,
                    type: data.type,
                    startDate,
                    endDate,
                    reason: data.reason,
                    attachment: data.attachment,
                    status: "PENDING",
                },
                include: {
                    users: {
                        select: {
                            id: true,
                            employee_number: true,
                            full_name: true,
                            email: true,
                            role: true,
                        },
                    },
                },
            });

            return created;
        });
    }

    async list(currentUser, { query } = {}) {
        const page = Math.max(1, Number(query?.page ?? 1));
        const limit = Math.max(1, Number(query?.limit ?? 10));
        const getAll = query?.get_all === true || query?.get_all === "true";

        const where = {};

        if (!this.isAdmin(currentUser)) {
            where.user_id = currentUser.id;
        }

        if (query?.type) {
            where.type = query.type;
        }

        if (query?.status) {
            where.status = query.status;
        }

        if (this.isAdmin(currentUser) && query?.user_id) {
            where.user_id = query.user_id;
        }

        if (query?.search) {
            where.reason = {
                contains: String(query.search),
                mode: "insensitive",
            };
        }

        const options = {
            where,
            orderBy: { created_at: "desc" },
            include: {
                users: {
                    select: {
                        id: true,
                        employee_number: true,
                        full_name: true,
                        email: true,
                        role: true,
                    },
                },
            },
            ...(getAll ? {} : { take: limit, skip: (page - 1) * limit }),
        };

        const [data, count] = await Promise.all([
            this.prisma.leaveRequest.findMany(options),
            this.prisma.leaveRequest.count({ where }),
        ]);

        return {
            data,
            meta: getAll
                ? null
                : {
                    totalItems: count,
                    totalPages: Math.ceil(count / limit),
                    currentpage: page,
                    itemsPerPage: limit,
                },
        };
    }

    async detail(currentUser, id) {
        const leaveRequest = await this.prisma.leaveRequest.findUnique({
            where: { id },
            include: {
                users: {
                    select: {
                        id: true,
                        employee_number: true,
                        full_name: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });

        if (!leaveRequest) {
            throw BaseError.notFound("Leave request not found");
        }

        if (!this.isAdmin(currentUser) && leaveRequest.user_id !== currentUser.id) {
            throw BaseError.forbidden("Forbidden to access this leave request");
        }

        return leaveRequest;
    }

    async update(currentUser, id, data) {
        return this.prisma.$transaction(async (tx) => {
            const current = await tx.leaveRequest.findUnique({ where: { id } });

            if (!current) {
                throw BaseError.notFound("Leave request not found");
            }

            const admin = this.isAdmin(currentUser);

            if (!admin && current.user_id !== currentUser.id) {
                throw BaseError.forbidden("Forbidden to update this leave request");
            }

            if (!admin && current.status !== "PENDING") {
                throw BaseError.badRequest("Only pending leave request can be updated");
            }

            if (!admin && data.status) {
                throw BaseError.forbidden("Only admin can change leave request status");
            }

            const nextStartDate = data.startDate ? new Date(data.startDate) : current.startDate;
            const nextEndDate = data.endDate ? new Date(data.endDate) : current.endDate;

            if (
                Number.isNaN(nextStartDate.getTime()) ||
                Number.isNaN(nextEndDate.getTime())
            ) {
                throw BaseError.badRequest("Invalid startDate or endDate");
            }

            if (nextEndDate < nextStartDate) {
                throw BaseError.badRequest("endDate must be greater than or equal to startDate");
            }

            const overlap = await tx.leaveRequest.findFirst({
                where: {
                    id: { not: id },
                    user_id: current.user_id,
                    status: { in: ["PENDING", "APPROVED"] },
                    startDate: { lte: nextEndDate },
                    endDate: { gte: nextStartDate },
                },
            });

            if (overlap) {
                throw BaseError.badRequest("Date range overlaps with an existing leave request");
            }

            const payload = {
                ...(data.type !== undefined ? { type: data.type } : {}),
                ...(data.reason !== undefined ? { reason: data.reason } : {}),
                ...(data.attachment !== undefined ? { attachment: data.attachment } : {}),
                ...(data.startDate !== undefined ? { startDate: nextStartDate } : {}),
                ...(data.endDate !== undefined ? { endDate: nextEndDate } : {}),
                ...(admin && data.status !== undefined ? { status: data.status } : {}),
            };

            const updated = await tx.leaveRequest.update({
                where: { id },
                data: payload,
                include: {
                    users: {
                        select: {
                            id: true,
                            employee_number: true,
                            full_name: true,
                            email: true,
                            role: true,
                        },
                    },
                },
            });

            return updated;
        });
    }

    async remove(currentUser, id) {
        return this.prisma.$transaction(async (tx) => {
            const current = await tx.leaveRequest.findUnique({ where: { id } });

            if (!current) {
                throw BaseError.notFound("Leave request not found");
            }

            const admin = this.isAdmin(currentUser);

            if (!admin && current.user_id !== currentUser.id) {
                throw BaseError.forbidden("Forbidden to remove this leave request");
            }

            if (!admin && current.status !== "PENDING") {
                throw BaseError.badRequest("Only pending leave request can be removed");
            }

            await tx.leaveRequest.delete({ where: { id } });

            return {
                message: "Leave request deleted successfully",
            };
        });
    }
}

export default new LeaverequestService();