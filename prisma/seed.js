import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const user = await prisma.user.upsert({
    where: { email: "superadmin@example.com" },
    update: {},
    create: {
      first_name: "Super",
      last_name: "Admin",
      email: "superadmin@example.com",
      password: hashedPassword,
      role: "SUPER_ADMIN",
    },
  });

  const department = await prisma.department.create({
    data: {
      name: "IT Department",
      start_salary: 6000000,
      end_salary: 15000000,
    },
  });

  const position = await prisma.position.create({
    data: {
      name: "Software Engineer",
      departmentId: department.id,
      levels: {
        create: [
          { name: "Junior" },
          { name: "Mid" },
          { name: "Senior" }
        ],
      },
    },
  });

  const allowance = await prisma.allowances.create({
    data: {
      allowance: "Meal Allowance",
      description: "Allowance for daily meals",
    },
  });

  const deduction = await prisma.deductions.create({
    data: {
      deduction: "Late Penalty",
      description: "Penalty for late attendance",
    },
  });

  const employee = await prisma.employee.create({
    data: {
      employee_number: "EMP-0002",
      name: "John Doe",
      email: "john2@example.com",
      status: "ACTIVE",
      join_date: new Date(),
      departmentId: department.id,
      positionId: position.id,
      salary: 8000000,
    },
  });

  const payroll = await prisma.payroll.create({
    data: {
      ref_no: "PR-2025-001",
      date_from: new Date("2025-11-01"),
      date_to: new Date("2025-11-15"),
      type: "MONTHLY",
      status: "POSTED",
    },
  });

  // === Tambahan lengkap ===
  await prisma.employeeAllowances.create({
    data: {
      employeeId: employee.id,
      allowanceId: allowance.id,
      type: "MONTHLY",
      amount: 750000,
      effective_date: new Date(),
    },
  });

  await prisma.employeeDeductions.create({
    data: {
      employeeId: employee.id,
      deductionId: deduction.id,
      type: "ONCE",
      amount: 150000,
      effective_date: new Date(),
    },
  });

  await prisma.attendance.createMany({
    data: [
      { employeeId: employee.id, log_type: "PRESENT", datetime_log: new Date() },
      { employeeId: employee.id, log_type: "LATE", datetime_log: new Date() },
      { employeeId: employee.id, log_type: "PRESENT", datetime_log: new Date() },
      { employeeId: employee.id, log_type: "ABSENT", datetime_log: new Date() },
    ],
  });

  await prisma.payrollItem.create({
    data: {
      payrollId: payroll.id,
      employeeId: employee.id,
      present: 2,
      absent: 1,
      late: 1,
      salary: employee.salary,
      allowance_amount: 750000,
      deductions: 150000,
    },
  });

  console.log("🚀 Seed completed successfully");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
