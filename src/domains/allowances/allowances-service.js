import BaseError from "../../base_classes/base-error.js";
import { PrismaService } from "../../common/services/prisma.service.js";
import { buildQueryOptions } from "../../utils/buildQueryOptions.js";
import allowancesQueryConfig from "./allowances-query-config.js";
import Joi from "joi";

class AllowancesService {
  constructor() {
    this.prisma = new PrismaService();
  }
  async create(currentUser, data) {
    let validation = "";
    const stack = [];
    const fail = (msg, path) => {
      validation += (validation ? " " : "") + msg;
      stack.push({ message: msg, path: [path] });
    };

    if (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN") {
      fail("Forbidden, only ADMIN is allowed to create Allowance", "role");
      throw new Joi.ValidationError(validation, stack);
    }

    return this.prisma.$transaction(async (tx) => {
      const allowancesExist = await tx.allowances.findFirst({
        where: { allowance: data.allowance },
      });

      if (allowancesExist) {
        fail("Allowance already exists", "allowance");
        throw new Joi.ValidationError(validation, stack);
      }

      const created = await tx.allowances.create({ data });
      return created;
    });
  }

  async detail(id) {
    const allowances = await this.prisma.allowances.findUnique({
      where: { id },
      include: allowancesQueryConfig.relations,
    });

    if (!allowances) throw BaseError.notFound("Allowances not found");
    return allowances;
  }

  async list({ query } = {}) {
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
      const current = await tx.allowances.findUnique({ where: { id } });
      if (!current) throw BaseError.notFound("Allowances not found");

      let validation = "";
      const stack = [];
      const fail = (msg, path) => {
        validation += (validation ? " " : "") + msg;
        stack.push({ message: msg, path: [path] });
      };

      if (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN") {
        fail("Forbidden, only ADMIN is allowed to update Allowance", "role");
        throw new Joi.ValidationError(validation, stack);
      }

      if (data.allowance) {
        const exists = await tx.allowances.findFirst({
          where: {
            allowance: data.allowance,
            NOT: { id },
          },
        });
        if (exists) {
          fail("Allowance already exists", "allowance");
          throw new Joi.ValidationError(validation, stack);
        }
      }

      return tx.allowances.update({
        where: { id },
        data,
      });
    });
  }

  async remove(id) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.allowances.findUnique({
        where: { id },
      });

      if (!current) {
        throw BaseError.notFound("Allowance not found");
      }

      // Cek apakah allowance digunakan employee
      const usageCount = await tx.employeeAllowances.count({
        where: { allowance_id: id },
      });

      if (usageCount > 0) {
        throw BaseError.badRequest(
          "Cannot delete allowance because it is still assigned to employees"
        );
      }

      // Aman → boleh delete allowance
      await tx.allowances.delete({
        where: { id },
      });

      return {
        message: "Allowance deleted successfully",
      };
    });
  }
}

export default new AllowancesService();
