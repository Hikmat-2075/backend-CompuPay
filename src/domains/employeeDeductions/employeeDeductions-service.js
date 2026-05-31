import BaseError from "../../base_classes/base-error.js";
import { PrismaService } from "../../common/services/prisma.service.js";
import { buildQueryOptions } from "../../utils/buildQueryOptions.js";
import employeeDeductionsQueryConfig from "./employeeDeductions-query-config.js";
import Joi from "joi";

class EmployeeDeductionsService {
  constructor() {
    this.prisma = new PrismaService();
  }

  isAdmin(currentUser) {
    return currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN";
  }

  cleanPayload(data) {
    const payload = { ...data };

    Object.keys(payload).forEach((key) => {
      if (payload[key] === "" || payload[key] === null) {
        delete payload[key];
      }
    });

    if (payload.amount !== undefined) {
      payload.amount = Number(payload.amount);
    }

    if (payload.effective_date !== undefined) {
      payload.effective_date = new Date(payload.effective_date);
    }

    return payload;
  }

  async create(currentUser, data) {
    let validation = "";
    const stack = [];

    const fail = (msg, path) => {
      validation += (validation ? " " : "") + msg;
      stack.push({ message: msg, path: [path] });
    };

    if (!this.isAdmin(currentUser)) {
      fail(
        "Forbidden, only ADMIN is allowed to create Employee Deduction",
        "role",
      );
      throw new Joi.ValidationError(validation, stack);
    }

    return this.prisma.$transaction(async (tx) => {
      const payload = this.cleanPayload(data);

      const employee = await tx.user.findUnique({
        where: { id: payload.user_id },
      });

      if (!employee) {
        fail("Employee not found", "user_id");
        throw new Joi.ValidationError(validation, stack);
      }

      const deduction = await tx.deductions.findUnique({
        where: { id: payload.deduction_id },
      });

      if (!deduction) {
        fail("Deduction not found", "deduction_id");
        throw new Joi.ValidationError(validation, stack);
      }

      const duplicate = await tx.employeeDeductions.findFirst({
        where: {
          user_id: payload.user_id,
          deduction_id: payload.deduction_id,
          type: payload.type,
          effective_date: payload.effective_date,
        },
      });

      if (duplicate) {
        fail(
          "Employee already has this deduction with the same type and effective date",
          "duplicate",
        );
        throw new Joi.ValidationError(validation, stack);
      }

      const created = await tx.employeeDeductions.create({
        data: payload,
        include: employeeDeductionsQueryConfig.relations,
      });

      return created;
    });
  }

  async detail(id) {
    const employeeDeduction = await this.prisma.employeeDeductions.findUnique({
      where: { id },
      include: employeeDeductionsQueryConfig.relations,
    });

    if (!employeeDeduction) {
      throw BaseError.notFound("Employee Deduction not found");
    }

    return employeeDeduction;
  }

  async list({ query } = {}) {
    const options = buildQueryOptions(employeeDeductionsQueryConfig, query);

    options.include = employeeDeductionsQueryConfig.relations;

    const [data, count] = await Promise.all([
      this.prisma.employeeDeductions.findMany(options),
      this.prisma.employeeDeductions.count({ where: options.where }),
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
    let validation = "";
    const stack = [];

    const fail = (msg, path) => {
      validation += (validation ? " " : "") + msg;
      stack.push({ message: msg, path: [path] });
    };

    if (!this.isAdmin(currentUser)) {
      fail(
        "Forbidden, only ADMIN is allowed to update Employee Deduction",
        "role",
      );
      throw new Joi.ValidationError(validation, stack);
    }

    return this.prisma.$transaction(async (tx) => {
      const current = await tx.employeeDeductions.findUnique({
        where: { id },
      });

      if (!current) {
        throw BaseError.notFound("Employee Deduction not found");
      }

      const payload = this.cleanPayload(data);

      if (payload.user_id) {
        const employee = await tx.user.findUnique({
          where: { id: payload.user_id },
        });

        if (!employee) {
          fail("Employee not found", "user_id");
          throw new Joi.ValidationError(validation, stack);
        }
      }

      if (payload.deduction_id) {
        const deduction = await tx.deductions.findUnique({
          where: { id: payload.deduction_id },
        });

        if (!deduction) {
          fail("Deduction not found", "deduction_id");
          throw new Joi.ValidationError(validation, stack);
        }
      }

      const nextUserId = payload.user_id ?? current.user_id;
      const nextDeductionId = payload.deduction_id ?? current.deduction_id;
      const nextType = payload.type ?? current.type;
      const nextEffectiveDate =
        payload.effective_date ?? current.effective_date;

      const duplicate = await tx.employeeDeductions.findFirst({
        where: {
          user_id: nextUserId,
          deduction_id: nextDeductionId,
          type: nextType,
          effective_date: nextEffectiveDate,
          id: {
            not: id,
          },
        },
      });

      if (duplicate) {
        fail(
          "Employee already has this deduction with the same type and effective date",
          "duplicate",
        );
        throw new Joi.ValidationError(validation, stack);
      }

      const updated = await tx.employeeDeductions.update({
        where: { id },
        data: payload,
        include: employeeDeductionsQueryConfig.relations,
      });

      return updated;
    });
  }

  async remove(id) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.employeeDeductions.findUnique({
        where: { id },
      });

      if (!current) {
        throw BaseError.notFound("Employee Deduction not found");
      }

      await tx.employeeDeductions.delete({
        where: { id },
      });

      return {
        message: "Employee Deduction deleted successfully",
      };
    });
  }
}

export default new EmployeeDeductionsService();
