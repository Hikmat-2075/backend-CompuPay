import BaseError from "../../base_classes/base-error.js";
import { PrismaService } from "../../common/services/prisma.service.js";
import Prisma from "@prisma/client";
import { buildQueryOptions } from "../../utils/buildQueryOptions.js";
import payrollQueryConfig from "./payroll-query-config.js";
import PDFDocument from "pdfkit";
import Joi from "joi";
import notificationService from "../notification/notification-service.js";

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
        if (a.type === "SEMI_MONTHLY") return data.type === "SEMI_MONTHLY";
        return false;
      });

      const allowanceAmount = allowancesFiltered.reduce(
        (total, a) => total.plus(a.amount),
        new Prisma.Decimal(0),
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
        if (d.type === "SEMI_MONTHLY") return data.type === "SEMI_MONTHLY";
        return false;
      });

      const deductionAmount = deductionsFiltered.reduce(
        (total, d) => total.plus(d.amount),
        new Prisma.Decimal(0),
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

          salary: Number(salary),
          allowance_amount: Number(allowanceAmount),
          deductions: Number(deductionAmount),
          net,
        },
      });

      return tx.payroll.findUnique({
        where: { id: payroll.id },
        include: payrollQueryConfig.relations,
      });
    });
  }

  async detail(currentUser, id) {
    const payroll = await this.prisma.payroll.findUnique({
      where: { id },
      include: payrollQueryConfig.relations,
    });

    if (!payroll) throw BaseError.notFound("Payroll not found");

    if (currentUser.role === "USER" && payroll.user_id !== currentUser.id) {
      throw BaseError.forbidden("You can only view your own payroll");
    }

    return payroll;
  }

  async list({ currentUser, query } = {}) {
    const fixedWhere = {};

    if (currentUser.role === "USER") {
      fixedWhere.user_id = currentUser.id;
    }

    const options = buildQueryOptions(payrollQueryConfig, query, fixedWhere);

    options.include = {
      ...options.include,
      employee: true,
      payer: true,
    };

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
            currentPage: Number(page),
            itemsPerPage: Number(limit),
          }
        : null,
    };
  }

  async update(currentUser, id, data) {
    if (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN") {
      throw BaseError.forbidden("You are not allowed to update payroll");
    }

    const payroll = await this.prisma.payroll.findUnique({
      where: { id },
    });

    if (!payroll) {
      throw BaseError.notFound("Payroll not found");
    }

    if (payroll.status !== "PENDING") {
      throw BaseError.badRequest(
        "Only payroll with PENDING status can be updated",
      );
    }

    if (data.status !== "PAID" && data.status !== "CANCELED") {
      throw BaseError.badRequest("Status must be PAID or CANCELED");
    }

    const updated = await this.prisma.payroll.update({
      where: { id },
      data: {
        status: data.status,
        paid_at: data.status === "PAID" ? new Date() : null,
        paid_by: data.status === "PAID" ? currentUser.id : null,
      },
    });

    await notificationService.createPayrollStatusNotification({
      userId: updated.user_id,
      payroll: updated,
    });

    return updated;
  }

  async remove(currentUser, id) {
    if (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN") {
      throw BaseError.forbidden("Only ADMIN can delete Payroll");
    }

    return this.prisma.$transaction(async (tx) => {
      const payroll = await tx.payroll.findUnique({ where: { id } });
      if (!payroll) throw BaseError.notFound("Payroll not found");

      // if (payroll.status !== "PENDING") {
      //   throw BaseError.badRequest(
      //     "Only payroll with PENDING status can be deleted"
      //   );
      // }

      await tx.payroll.delete({ where: { id } });

      return { message: "Payroll deleted successfully" };
    });
  }
  async downloadPdf(currentUser, id) {
    const payroll = await this.detail(currentUser, id);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      const formatDate = (date) =>
        date
          ? new Intl.DateTimeFormat("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            }).format(new Date(date))
          : "-";

      const formatCurrency = (value) =>
        new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(Number(value || 0));

      const employee = payroll.employee;
      const department = employee?.department?.name ?? "-";
      const position = employee?.position?.name ?? "-";

      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .text("CompuPay", { align: "center" });

      doc
        .moveDown(0.3)
        .fontSize(14)
        .text("PAYSLIP / SLIP GAJI", { align: "center" });

      doc.moveDown(1.5);

      doc.fontSize(10).font("Helvetica-Bold").text("Informasi Payroll");
      doc.moveDown(0.5);

      const info = [
        ["No. Referensi", payroll.ref_no],
        [
          "Periode",
          `${formatDate(payroll.date_from)} - ${formatDate(payroll.date_to)}`,
        ],
        ["Tipe Payroll", payroll.type],
        ["Status", payroll.status],
        ["Tanggal Dibuat", formatDate(payroll.created_at)],
        ["Tanggal Dibayar", formatDate(payroll.paid_at)],
      ];

      info.forEach(([label, value]) => {
        doc
          .font("Helvetica-Bold")
          .text(label, 50, doc.y, { continued: true, width: 130 });
        doc.font("Helvetica").text(`: ${value}`);
      });

      doc.moveDown(1);

      doc.font("Helvetica-Bold").text("Informasi Karyawan");
      doc.moveDown(0.5);

      const employeeInfo = [
        ["Nama", employee?.full_name ?? "-"],
        ["Email", employee?.email ?? "-"],
        ["Nomor Karyawan", employee?.employee_number ?? "-"],
        ["Departemen", department],
        ["Posisi", position],
      ];

      employeeInfo.forEach(([label, value]) => {
        doc
          .font("Helvetica-Bold")
          .text(label, 50, doc.y, { continued: true, width: 130 });
        doc.font("Helvetica").text(`: ${value}`);
      });

      doc.moveDown(1.5);

      const startX = 50;
      const tableWidth = 495;
      const labelWidth = 330;
      const amountWidth = tableWidth - labelWidth;
      const rowHeight = 32;

      const drawRow = (label, amount, y, bold = false) => {
        doc.rect(startX, y, tableWidth, rowHeight).stroke();
        doc
          .moveTo(startX + labelWidth, y)
          .lineTo(startX + labelWidth, y + rowHeight)
          .stroke();

        doc
          .font(bold ? "Helvetica-Bold" : "Helvetica")
          .fontSize(10)
          .text(label, startX + 10, y + 10, { width: labelWidth - 20 });

        doc.text(amount, startX + labelWidth + 10, y + 10, {
          width: amountWidth - 20,
          align: "right",
        });
      };

      let y = doc.y;

      doc.font("Helvetica-Bold").fontSize(11).text("Rincian Gaji", startX, y);
      y += 25;

      drawRow("Gaji Pokok", formatCurrency(payroll.salary), y);
      y += rowHeight;
      drawRow("Total Tunjangan", formatCurrency(payroll.allowance_amount), y);
      y += rowHeight;
      drawRow("Total Potongan", `- ${formatCurrency(payroll.deductions)}`, y);
      y += rowHeight;
      drawRow("Gaji Bersih", formatCurrency(payroll.net), y, true);

      doc.moveDown(4);

      doc
        .fontSize(9)
        .font("Helvetica")
        .text(
          "Dokumen ini dibuat secara otomatis oleh sistem CompuPay dan sah tanpa tanda tangan basah.",
          50,
          730,
          { align: "center" },
        );

      doc.end();
    });
  }
}

export default new PayrollService();
