import BaseError from "../../base_classes/base-error.js";
import { PrismaService } from "../../common/services/prisma.service.js";
import { buildQueryOptions } from "../../utils/buildQueryOptions.js";
import payrollItemQueryConfig from "./payrollItem-query-config.js";
import Joi from "joi";

class PayrollItemService {
  constructor() {
    this.prisma = new PrismaService();
  }

  async create(data) {
    let validation = "";
    const stack = [];
    const fail = (msg, path) => {
      validation += (validation ? " " : "") + msg;
      stack.push({ message: msg, path: [path] });
    };

    return this.prisma.$transaction(async (tx) => {
      // Check payroll exist
      const payroll = await tx.payroll.findUnique({
        where: { id: data.payroll_id },
      });
      if (!payroll) {
        fail("Payroll not found", "payroll_id");
        throw new Joi.ValidationError(validation, stack);
      }

      // Check employee exist
      const employee = await tx.employee.findUnique({
        where: { id: data.user_id },
      });
      if (!employee) {
        fail("Employee not found", "user_id");
        throw new Joi.ValidationError(validation, stack);
      }

      // Check duplicate payroll item
      const duplicate = await tx.payrollItem.findFirst({
        where: { payroll_id: data.payroll_id, user_id: data.user_id },
      });
      if (duplicate) {
        fail("Employee already included in this payroll", "user_id");
        throw new Joi.ValidationError(validation, stack);
      }

      // Salary base
      const salary = employee.salary ?? 0;

      // Get allowances & deductions automatically
      const empAllowances = await tx.employeeAllowances.findMany({
        where: { user_id: employee.id },
      });
      const empDeductions = await tx.employeeDeductions.findMany({
        where: { user_id: employee.id },
      });

      const allowance = empAllowances.reduce((t, a) => t + a.amount, 0);
      const deductions = empDeductions.reduce((t, d) => t + d.amount, 0);

      const net = salary + allowance - deductions;

      const created = await tx.payrollItem.create({
        data: {
          payroll_id: data.payroll_id,
          user_id: data.user_id,
          present: data.present ?? 0,
          absent: data.absent ?? 0,
          late: data.late ?? 0,
          salary,
          allowance_amount: allowance,
          deductions,
          net,
        },
      });

      return created;
    });
  }

  async detail(id) {
    const payrollItem = await this.prisma.payrollItem.findUnique({
      where: { id },
      include: payrollItemQueryConfig.relations,
    });

    if (!payrollItem) {
      throw BaseError.notFound("Payroll Item not found");
    }

    return payrollItem;
  }

  async list({ query } = {}) {
    const options = buildQueryOptions(payrollItemQueryConfig, query);
    options.include = payrollItemQueryConfig.relations;
    const [data, count] = await Promise.all([
      this.prisma.payrollItem.findMany(options),
      this.prisma.payrollItem.count({ where: options.where }),
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

  async update(id, data) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.payrollItem.findUnique({
        where: { id },
      });

      if (!current) {
        throw BaseError.notFound("Payroll Item not found");
      }

      const updated = await tx.payrollItem.update({
        where: { id },
        data,
      });

      return updated;
    });
  }

  async remove(id) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.payrollItem.findUnique({
        where: { id },
      });

      if (!current) {
        throw BaseError.notFound("Payroll Item not found");
      }

      // ambil payroll
      const payroll = await tx.payroll.findUnique({
        where: { id: current.payroll_id },
      });

      if (!payroll) {
        throw BaseError.notFound("Payroll not found");
      }

      // hanya payroll berstatus draft yang boleh diubah/dihapus itemnya
      if (payroll.status !== "DRAFT") {
        throw BaseError.badRequest(
          "Payroll Item cannot be deleted because the payroll is no longer in DRAFT status"
        );
      }

      const deleted = await tx.payrollItem.delete({
        where: { id },
      });

      return {
        message: "Payroll Item deleted successfully",
        // data: deleted
      };
    });
  }
}

export default new PayrollItemService();
