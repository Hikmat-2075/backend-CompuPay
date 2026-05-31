import BaseError from "../../base_classes/base-error.js";
import { PrismaService } from "../../common/services/prisma.service.js";
import { buildQueryOptions } from "../../utils/buildQueryOptions.js";
import pointRecordQueryConfig from "./PointRecord-query-config.js";

class PointRecordService {
  constructor() {
    this.prisma = new PrismaService();
  }

  canAccessAll(currentUser) {
    return currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN";
  }

  ensureAdmin(currentUser) {
    if (!this.canAccessAll(currentUser)) {
      throw BaseError.forbidden("You are not allowed to manage point record");
    }
  }

  async list({ currentUser, query } = {}) {
    const fixedWhere = {};

    if (!this.canAccessAll(currentUser)) {
      fixedWhere.attendance = {
        employeeId: currentUser.id,
      };
    }

    const options = buildQueryOptions(
      pointRecordQueryConfig,
      query,
      fixedWhere,
    );

    options.include = pointRecordQueryConfig.relations;

    const [data, count] = await Promise.all([
      this.prisma.pointRecord.findMany(options),
      this.prisma.pointRecord.count({
        where: options.where,
      }),
    ]);

    const page = Number(query?.pagination?.page ?? 1);
    const limit = Number(query?.pagination?.limit ?? 10);
    const hasPagination = !!(query?.pagination && !query?.get_all);
    const totalPages = hasPagination ? Math.ceil(count / limit) : 1;

    return {
      data,
      meta: hasPagination
        ? {
            totalItems: count,
            totalPages,
            currentPage: page,
            itemsPerPage: limit,
          }
        : null,
    };
  }

  async detail(currentUser, id) {
    const data = await this.prisma.pointRecord.findUnique({
      where: { id },
      include: pointRecordQueryConfig.relations,
    });

    if (!data) {
      throw BaseError.notFound("Point record not found");
    }

    if (
      !this.canAccessAll(currentUser) &&
      data.attendance.employeeId !== currentUser.id
    ) {
      throw BaseError.forbidden("You can only view your own point record");
    }

    return data;
  }

  async update(currentUser, id, data) {
    this.ensureAdmin(currentUser);

    const current = await this.prisma.pointRecord.findUnique({
      where: { id },
    });

    if (!current) {
      throw BaseError.notFound("Point record not found");
    }

    const point = Number(data.point);

    if (Number.isNaN(point)) {
      throw BaseError.badRequest("Point must be a valid number");
    }

    const updated = await this.prisma.pointRecord.update({
      where: { id },
      data: {
        point,
      },
      include: pointRecordQueryConfig.relations,
    });

    return updated;
  }

  async remove(currentUser, id) {
    this.ensureAdmin(currentUser);

    const current = await this.prisma.pointRecord.findUnique({
      where: { id },
    });

    if (!current) {
      throw BaseError.notFound("Point record not found");
    }

    await this.prisma.pointRecord.delete({
      where: { id },
    });

    return {
      message: "Point record deleted successfully",
    };
  }
}

export default new PointRecordService();
