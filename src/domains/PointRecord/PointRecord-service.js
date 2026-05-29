import BaseError from "../../base_classes/base-error.js";
import { PrismaService } from "../../common/services/prisma.service.js";
import { buildQueryOptions } from "../../utils/buildQueryOptions.js";

class PointRecordService {
  constructor() {
    this.prisma = new PrismaService();
  }

  _parseTotalPointRange(filter) {
    const minRaw = filter?.total_point_min;
    const maxRaw = filter?.total_point_max;

    const min = minRaw !== undefined ? Number(minRaw) : undefined;
    const max = maxRaw !== undefined ? Number(maxRaw) : undefined;

    if (
      (minRaw !== undefined && Number.isNaN(min)) ||
      (maxRaw !== undefined && Number.isNaN(max))
    ) {
      throw BaseError.badRequest("total_point_min and total_point_max must be numbers");
    }

    return { min, max };
  }

  async list({ query } = {}) {
    // config inline untuk User (pegawai)
    const userQueryConfig = {
      searchableFields: ["full_name", "id", "employee_number"],
      filterableFields: ["department_id"],
      orderableFields: ["id", "full_name", "employee_number", "created_at"],
      relations: {
        department: true,
        position: true,
      },
      dateFields: {
        created_at: "created_at",
        updated_at: "updated_at",
      },
    };

    // 1) ambil SEMUA user yang match search+department (tanpa pagination),
    // karena kita perlu filter berdasarkan hasil SUM(total_point)
    const baseQuery = {
      ...(query ?? {}),
      get_all: true,
      pagination: undefined,
    };

    const options = buildQueryOptions(userQueryConfig, baseQuery);

    // include untuk UI
    options.include = {
      department: true,
      position: true,
    };

    const users = await this.prisma.user.findMany(options);

    if (users.length === 0) {
      return {
        data: [],
        meta: {
          totalItems: 0,
          totalPages: 0,
          currentpage: Number(query?.pagination?.page ?? 1),
          itemsPerPage: Number(query?.pagination?.limit ?? 10),
        },
      };
    }

    const userIds = users.map((u) => u.id);

    // 2) ambil PointRecord rows untuk semua userIds itu (via attendance.employeeId)
    const pointRows = await this.prisma.pointRecord.findMany({
      where: {
        attendance: {
          employeeId: { in: userIds },
        },
      },
      select: {
        point: true,
        attendance: { select: { employeeId: true } },
      },
    });

    // 3) SUM point per user
    const totals = new Map(); // employeeId -> sum(point)
    for (const row of pointRows) {
      const employeeId = row.attendance.employeeId;
      const prev = totals.get(employeeId) ?? 0;
      totals.set(employeeId, prev + (row.point ?? 0));
    }

    // 4) build rows rekap
    let recap = users.map((u) => ({
      ...u,
      total_point: totals.get(u.id) ?? 0,
    }));

    // 5) filter by total_point range (HAVING version in app-layer)
    const { min, max } = this._parseTotalPointRange(query?.filter);

    if (min !== undefined) recap = recap.filter((r) => r.total_point >= min);
    if (max !== undefined) recap = recap.filter((r) => r.total_point <= max);

    // 6) pagination manual (karena filtering terjadi setelah agregasi)
    const page = Number(query?.pagination?.page ?? 1);
    const limit = Number(query?.pagination?.limit ?? 10);

    const hasPagination = !!(query?.pagination && !query?.get_all);
    const totalItems = recap.length;
    const totalPages = hasPagination ? Math.ceil(totalItems / limit) : 1;

    if (hasPagination) {
      const start = (page - 1) * limit;
      recap = recap.slice(start, start + limit);
    }

    return {
      data: recap,
      meta: hasPagination
        ? {
            totalItems,
            totalPages,
            currentpage: Number(page),
            itemsPerPage: Number(limit),
          }
        : null,
    };
  }

  async detail(userId) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        department: true,
        position: true,
      },
    });

    if (!user) throw BaseError.notFound("User not found");

    const rows = await this.prisma.pointRecord.findMany({
      where: {
        attendance: { employeeId: userId },
      },
      select: { point: true },
    });

    const total_point = rows.reduce((sum, r) => sum + (r.point ?? 0), 0);

    return { ...user, total_point };
  }
}

export default new PointRecordService();