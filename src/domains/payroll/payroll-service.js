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

  // 🔐 Authorization
  if (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN") {
    fail("Forbidden, only ADMIN can create Payroll", "role");
    throw new Joi.ValidationError(validation, stack);
  }

  const dateFrom = new Date(data.date_from);
  const dateTo = new Date(data.date_to);

  if (dateFrom > dateTo) {
    fail("date_from cannot be greater than date_to", "date_from");
    throw new Joi.ValidationError(validation, stack);
  }

  return this.prisma.$transaction(async (tx) => {

    // 🔎 Unique payroll per user + period + type
    const existingPayroll = await tx.payroll.findFirst({
      where: {
        user_id: data.user_id,
        date_from: dateFrom,
        date_to: dateTo,
        type: data.type,
      },
    });

    if (existingPayroll) {
      fail("Payroll for this period already exists", "period");
      throw new Joi.ValidationError(validation, stack);
    }

    // 🔎 Unique ref_no
    const refExist = await tx.payroll.findFirst({
      where: { ref_no: data.ref_no },
    });

    if (refExist) {
      fail("Reference number already exists", "ref_no");
      throw new Joi.ValidationError(validation, stack);
    }

    // 👤 Employee
    const employee = await tx.user.findUnique({
      where: { id: data.user_id },
    });

    if (!employee) {
      fail("Employee not found", "user_id");
      throw new Joi.ValidationError(validation, stack);
    }

    // 💰 Base salary (snapshot)
    const salary = new Prisma.Decimal(employee.salary);

    // =========================
    // ➕ ALLOWANCES
    // =========================
    const allowancesRaw = await tx.employeeAllowances.findMany({
      where: {
        user_id: employee.id,
        effective_date: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
    });

    const allowancesFiltered = allowancesRaw.filter((a) => {
      if (a.type === "ONCE") return true;
      if (a.type === "MONTHLY") return true;
      if (a.type === "SEMI_MONTHLY")
        return data.type === "SEMI_MONTHLY";
      return false;
    });

    const allowanceAmount = allowancesFiltered.reduce(
      (total, a) => total.plus(a.amount),
      new Prisma.Decimal(0)
    );

    // =========================
    // ➖ DEDUCTIONS
    // =========================
    const deductionsRaw = await tx.employeeDeductions.findMany({
      where: {
        user_id: employee.id,
        effective_date: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
    });

    const deductionsFiltered = deductionsRaw.filter((d) => {
      if (d.type === "ONCE") return true;
      if (d.type === "MONTHLY") return true;
      if (d.type === "SEMI_MONTHLY")
        return data.type === "SEMI_MONTHLY";
      return false;
    });

    const deductionAmount = deductionsFiltered.reduce(
      (total, d) => total.plus(d.amount),
      new Prisma.Decimal(0)
    );

    // =========================
    // 🧮 NET SALARY
    // =========================
    const net = salary.plus(allowanceAmount).minus(deductionAmount);

    // =========================
    // 📝 CREATE PAYROLL
    // =========================
    const payroll = await tx.payroll.create({
      data: {
        ref_no: data.ref_no,
        user_id: employee.id,

        date_from: dateFrom,
        date_to: dateTo,

        type: data.type,
        status: "PENDING",

        salary,
        allowance_amount: allowanceAmount,
        deductions: deductionAmount,
        net,
      },
    });

    return tx.payroll.findUnique({
      where: { id: payroll.id },
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
    if (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN") {
      throw BaseError.forbidden("Only ADMIN can update payroll");
    }

    return this.prisma.$transaction(async (tx) => {
      const payroll = await tx.payroll.findUnique({ where: { id } });
      if (!payroll) throw BaseError.notFound("Payroll not found");

      if (payroll.status !== "PENDING") {
        throw BaseError.badRequest(
          "Only payroll with PENDING status can be updated"
        );
      }

      // 🚫 Jangan izinkan edit ref_no, salary, dll
      if (data.status && data.status !== "CANCELLED") {
        throw BaseError.badRequest(
          "Only status CANCELLED is allowed via update"
        );
      }

      const updated = await tx.payroll.update({
        where: { id },
        data: {
          status: "CANCELLED",
        },
      });

      return tx.payroll.findUnique({
        where: { id: updated.id },
        include: payrollQueryConfig.relations,
      });
    });
  }

  async pay(currentUser, id) {
    if (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN") {
      throw BaseError.forbidden("Only ADMIN can pay payroll");
    }

    return this.prisma.$transaction(async (tx) => {
      const payroll = await tx.payroll.findUnique({ where: { id } });
      if (!payroll) throw BaseError.notFound("Payroll not found");

      if (payroll.status !== "PENDING") {
        throw BaseError.badRequest("Payroll is not in PENDING state");
      }

      const updated = await tx.payroll.update({
        where: { id },
        data: {
          status: "PAID",
        },
      });

      return tx.payroll.findUnique({
        where: { id: updated.id },
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
