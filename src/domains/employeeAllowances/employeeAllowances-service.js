import BaseError from "../../base_classes/base-error.js";
import { PrismaService } from "../../common/services/prisma.service.js";
import { buildQueryOptions } from "../../utils/buildQueryOptions.js";
import employeeAllowancesQueryConfig from "./employeeAllowances-query-config.js";
import Joi from "joi";

class EmployeeAllowancesService {
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
      fail(
        "Forbidden, only ADMIN is allowed to create Employee Allowance",
        "role"
      );
      throw new Joi.ValidationError(validation, stack);
    }

    return this.prisma.$transaction(async (tx) => {
      // Check employee exists
      const employee = await tx.user.findUnique({
        where: { id: data.user_id },
      });
      if (!employee) {
        fail("Employee not found", "user_id");
        throw new Joi.ValidationError(validation, stack);
      }

      // Check allowance exists
      const allowance = await tx.allowances.findUnique({
        where: { id: data.allowance_id },
      });
      if (!allowance) {
        fail("Allowance not found", "allowance_id");
        throw new Joi.ValidationError(validation, stack);
      }

      // Optional business rule:
      // Prevent duplicate allowance type at same effective date
      const duplicate = await tx.employeeAllowances.findFirst({
        where: {
          userId: data.userId,
          allowance_id: data.allowance_id,
          effective_date: data.effective_date,
        },
      });

      if (duplicate) {
        fail(
          "Employee already has this allowance on the same effective date",
          "effective_date"
        );
        throw new Joi.ValidationError(validation, stack);
      }

      const created = await tx.employeeAllowances.create({ data });
      return created;
    });
  }

  async detail(id) {
    const employeeAllowance = await this.prisma.employeeAllowances.findUnique({
      where: { id },
      include: employeeAllowancesQueryConfig.relations,
    });

    if (!employeeAllowance) {
      throw BaseError.notFound("Employee Allowance not found");
    }

    return employeeAllowance;
  }

  async list({ query } = {}) {
    const options = buildQueryOptions(employeeAllowancesQueryConfig, query);

    options.include = employeeAllowancesQueryConfig.relations;
    const [data, count] = await Promise.all([
      this.prisma.employeeAllowances.findMany(options),
      this.prisma.employeeAllowances.count({ where: options.where }),
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
    let validation = "";
    const stack = [];
    const fail = (msg, path) => {
      validation += (validation ? " " : "") + msg;
      stack.push({ message: msg, path: [path] });
    };

    // Authorization
    if (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN") {
      fail(
        "Forbidden, only ADMIN is allowed to update Employee Allowance",
        "role"
      );
      throw new Joi.ValidationError(validation, stack);
    }

    return this.prisma.$transaction(async (tx) => {
      // Check existing record
      const current = await tx.employeeAllowances.findUnique({
        where: { id },
      });

      if (!current) {
        throw BaseError.notFound("Employee Allowance not found");
      }

      // Validate userId if included
      if (data.userId && data.userId !== current.userId) {
        const userExist = await tx.user.findUnique({
          where: { id: data.userId },
        });
        if (!userExist) {
          fail("User not found", "userId");
          throw new Joi.ValidationError(validation, stack);
        }
      }

      // Validate allowance_id if included
      if (data.allowance_id && data.allowance_id !== current.allowance_id) {
        const allowanceExist = await tx.allowances.findUnique({
          where: { id: data.allowance_id },
        });
        if (!allowanceExist) {
          fail("Allowance not found", "allowance_id");
          throw new Joi.ValidationError(validation, stack);
        }
      }

      // Validate amount if included
      if (
        data.amount !== undefined &&
        (isNaN(data.amount) || data.amount < 0)
      ) {
        fail("Amount must be a valid positive number", "amount");
        throw new Joi.ValidationError(validation, stack);
      }

      // Validate effective_date if included
      if (data.effective_date && isNaN(Date.parse(data.effective_date))) {
        fail("Invalid effective date format", "effective_date");
        throw new Joi.ValidationError(validation, stack);
      }

      const updated = await tx.employeeAllowances.update({
        where: { id },
        data,
      });

      return updated;
    });
  }

  async remove(id) {
    return this.prisma.$transaction(async (tx) => {
      // Cek apakah allowance ada
      const current = await tx.employeeAllowances.findUnique({
        where: { id },
      });

      if (!current) {
        throw BaseError.notFound("Employee Allowance not found");
      }

      // Cek apakah dipakai di payroll item (jika ada relasi)
      // const inUse = await tx.payroll.findFirst({
      //   where: { allowance_id: id }, // sesuaikan jika field berbeda
      // });

      // if (inUse) {
      //   throw BaseError.badRequest(
      //     "This allowance cannot be deleted because it is already used in payroll."
      //   );
      // }

      // Hapus
      const deleted = await tx.employeeAllowances.delete({
        where: { id },
      });

      return {
        message: "Employee Allowance deleted successfully",
        //data: deleted
      };
    });
  }
}

export default new EmployeeAllowancesService();
