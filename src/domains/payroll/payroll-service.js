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

    if (currentUser.position?.name !== "HR") {
      fail("Forbidden, only HR is allowed to create Payroll", "role");
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

      const employee = await tx.user.findUnique({
        where: { id: data.user_id },
      });

      if (!employee) {
        fail("Employee not found", "user_id");
        throw new Joi.ValidationError(validation, stack);
      }

      const salary = new Prisma.Decimal(employee.salary);

      // ✅ Allowance AKTIF & sesuai tanggal payroll
      const empAllowances = await tx.employeeAllowances.findMany({
        where: {
          user_id: employee.id,
          effective_date: { lte: new Date(data.date_to) },
        },
      });

      const allowance = empAllowances.reduce(
        (t, a) => t.plus(a.amount),
        new Prisma.Decimal(0)
      );

      // ✅ Deduction AKTIF & sesuai tanggal payroll
      const empDeductions = await tx.employeeDeductions.findMany({
        where: {
          user_id: employee.id,
          effective_date: { lte: new Date(data.date_to) },
        },
      });

      const deductions = empDeductions.reduce(
        (t, d) => t.plus(d.amount),
        new Prisma.Decimal(0)
      );

      const net = salary.plus(allowance).minus(deductions);

      const created = await tx.payroll.create({
        data: {
          ref_no: data.ref_no,
          user_id: employee.id,

          date_from: new Date(data.date_from),
          date_to: new Date(data.date_to),

          type: data.type,
          status: "PENDING",

          salary,
          allowance_amount: allowance,
          deductions,
          net,
        },
      });

      return tx.payroll.findUnique({
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
    if (currentUser.position?.name !== "HR") {
      throw BaseError.forbidden("Only HR can update payroll");
    }

    return this.prisma.$transaction(async (tx) => {
      const current = await tx.payroll.findUnique({ where: { id } });
      if (!current) throw BaseError.notFound("Payroll not found");

      if (current.status !== "PENDING") {
        throw BaseError.badRequest(
          "Only payroll with PENDING status can be updated"
        );
      }

      if (data.ref_no) {
        const refExist = await tx.payroll.findFirst({
          where: { ref_no: data.ref_no, NOT: { id } },
        });
        if (refExist) {
          throw BaseError.badRequest("Reference number already exists");
        }
      }

      await tx.payroll.update({
        where: { id },
        data: {
          ref_no: data.ref_no,
          status: data.status,
        },
      });

      return tx.payroll.findUnique({
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
