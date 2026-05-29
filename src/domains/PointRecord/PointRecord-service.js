import BaseError from "../../base_classes/base-error.js";
import { PrismaService } from "../../common/services/prisma.service.js";

class PointRecordService {
  constructor() {
    this.prisma = new PrismaService();
  }

  async list({ query } = {}) {
    const search = query?.search || "";
    const departmentId = query?.filter?.department_id;
    const minPoint = query?.filter?.total_point_min !== undefined ? Number(query?.filter?.total_point_min) : undefined;
    const maxPoint = query?.filter?.total_point_max !== undefined ? Number(query?.filter?.total_point_max) : undefined;

    const page = Number(query?.pagination?.page ?? 1);
    const limit = Number(query?.pagination?.limit ?? 10);
    const getAll = !!query?.get_all;

    // 1. Susun filter pencarian User (Pegawai)
    const userWhereClause = {
      status: "ACTIVE",
      ...(search && {
        OR: [
          { full_name: { contains: search, mode: "insensitive" } },
          { employee_number: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(departmentId && { department_id: departmentId }),
    };

    // 2. Ambil data User dan join ke relasi Attendances -> PointRecord
    const usersData = await this.prisma.user.findMany({
      where: userWhereClause,
      include: {
        department: true,
        position: true,
        attendances: {
          include: {
            pointRecord: true,
          },
        },
      },
    });

    // 3. Rekapitulasi Point (SUM) per User di level internal aplikasi
    let recap = usersData.map((user) => {
      const totalPoint = user.attendances.reduce((sum, att) => {
        return sum + (att.pointRecord?.point ?? 0);
      }, 0);

      // Pisahkan field relasi mentah agar return clean & secure
      const { attendances, password, ...userFields } = user;

      return {
        ...userFields,
        total_point: totalPoint,
      };
    });

    // 4. Lakukan filter berdasarkan range hasil Agregasi Point (Having filter)
    if (minPoint !== undefined && !Number.isNaN(minPoint)) {
      recap = recap.filter((item) => item.total_point >= minPoint);
    }
    if (maxPoint !== undefined && !Number.isNaN(maxPoint)) {
      recap = recap.filter((item) => item.total_point <= maxPoint);
    }

    // 5. Pagination manual setelah data tersaring penuh
    const totalItems = recap.length;
    const totalPages = getAll ? 1 : Math.ceil(totalItems / limit);

    if (!getAll) {
      const start = (page - 1) * limit;
      recap = recap.slice(start, start + limit);
    }

    return {
      data: recap,
      meta: !getAll
        ? {
          totalItems,
          totalPages,
          currentpage: page, // Menggunakan huruf kecil 'currentpage' sesuai pembacaan di React
          itemsPerPage: limit,
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

    // Ambil semua attendances milik user ini, lengkap dengan point record-nya
    const attendancesWithPoints = await this.prisma.attendance.findMany({
      where: { employeeId: userId },
      include: {
        pointRecord: true,
      },
    });

    // Kalkulasi total poin
    const total_point = attendancesWithPoints.reduce((sum, att) => {
      return sum + (att.pointRecord?.point ?? 0);
    }, 0);

    const { password, ...cleanUser } = user;

    return { ...cleanUser, total_point };
  }
}

export default new PointRecordService();