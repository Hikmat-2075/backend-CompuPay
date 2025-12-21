import BaseError from "../../base_classes/base-error.js";
import { PrismaService } from "../../common/services/prisma.service.js";
import { buildQueryOptions } from "../../utils/buildQueryOptions.js";
import payrollQueryConfig from "./payroll-query-config.js";
import Joi from "joi";

class PayrollService {
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

    if (currentUser.position.name !== "HR") {
      fail(
        "Forbidden, only HRnpm run dev is allowed to create Payroll",
        "role"
      );
      throw new Joi.ValidationError(validation, stack);
    }

    return this.prisma.$transaction(async (tx) => {
      const payrollExist = await tx.payroll.findFirst({
        where: { ref_no: data.ref_no },
      });
      if (payrollExist) {
        fail("Reference number already exists", "ref_no");
        throw new Joi.ValidationError(validation, stack);
      }

      // cek employee id
      const employee = await tx.user.findUnique({
        where: { id: data.user_id },
      });
      if (!employee) {
        fail("Employee not found", "user_id");
        throw new Joi.ValidationError(validation, stack);
      }

      // create payroll
      const created = await tx.payroll.create({
        data,
      });

      return await tx.payroll.findUnique({
        where: { id: created.id },
        include: payrollQueryConfig.relations,
      });
    });
  }

  async detail(id) {
    const payroll = await this.prisma.payroll.findUnique({
      where: { id },
      include: payrollQueryConfig.relations,
    });

    if (!payroll) throw BaseError.notFound("Payroll not found");
    return payroll;
  }

  async list({ query } = {}) {
    const options = buildQueryOptions(payrollQueryConfig, query);
    options.include = payrollQueryConfig.relations;

    const [data, count] = await Promise.all([
      this.prisma.payroll.findMany(options),
      this.prisma.payroll.count({ where: options.where }),
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
      const current = await tx.payroll.findUnique({ where: { id } });
      if (!current) throw BaseError.notFound("Payroll not found");

      let validation = "";
      const stack = [];
      const fail = (msg, path) => {
        validation += (validation ? " " : "") + msg;
        stack.push({ message: msg, path: [path] });
      };

      if (currentUser.position.name !== "HR") {
        fail("Forbidden, only HR is allowed to update Payroll", "role");
        throw new Joi.ValidationError(validation, stack);
      }

      // cek ref_no duplicate
      if (data.ref_no) {
        const refExist = await tx.payroll.findFirst({
          where: { ref_no: data.ref_no, NOT: { id } },
        });
        if (refExist) {
          fail("Reference number already exists", "ref_no");
          throw new Joi.ValidationError(validation, stack);
        }
      }

      // cek user_id jika diupdate
      if (data.user_id) {
        const employee = await tx.user.findUnique({
          where: { id: data.user_id },
        });
        if (!employee) {
          fail("Employee not found", "user_id");
          throw new Joi.ValidationError(validation, stack);
        }
      }

      const updated = await tx.payroll.update({
        where: { id },
        data,
      });

      return await tx.payroll.findUnique({
        where: { id },
        include: payrollQueryConfig.relations,
      });
    });
  }

  async remove(currentUser, id) {
    if (currentUser.role !== "ADMIN") {
      throw BaseError.forbidden("Only ADMIN can delete Payroll");
    }

    return this.prisma.$transaction(async (tx) => {
      const payroll = await tx.payroll.findUnique({ where: { id } });
      if (!payroll) throw BaseError.notFound("Payroll not found");

      if (payroll.status !== "PENDING") {
        throw BaseError.badRequest(
          "Only payroll with PENDING status can be deleted"
        );
      }

      await tx.payroll.delete({ where: { id } });

      return { message: "Payroll deleted successfully" };
    });
  }
}

export default new PayrollService();
