import { PrismaClient , Prisma } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Start seeding...");

  /* =======================
   * 1. DEPARTMENT
   * ======================= */
  const department = await prisma.department.create({
    data: {
      name: "Information Technology",
      start_salary: 5000000,
      end_salary: 20000000,
      description: "Handles IT infrastructure & systems",
    },
  });

  /* =======================
   * 2. POSITION
   * ======================= */
  const positionHR = await prisma.position.create({
    data: {
      name: "HR",
      department_id: department.id,
    },
  });

  const positionStaff = await prisma.position.create({
    data: {
      name: "Staff",
      department_id: department.id,
    },
  });

  /* =======================
   * 3. USERS
   * ======================= */
  const password = await bcrypt.hash("admin123", 10);

  const superAdmin = await prisma.user.create({
    data: {
      employee_number: "EMP-0001",
      full_name: "Super Admin",
      email: "superadmin@gmail.com",
      password,
      role: "SUPER_ADMIN",
      join_date: new Date(),
      department_id: department.id,
      position_id: positionHR.id,
      salary: 20000000,
    },
  });

  const hrUser = await prisma.user.create({
    data: {
      employee_number: "EMP-0002",
      full_name: "HR Manager",
      email: "hr@gmail.com",
      password,
      role: "ADMIN",
      join_date: new Date(),
      department_id: department.id,
      position_id: positionHR.id,
      salary: 15000000,
    },
  });

  const employee = await prisma.user.create({
    data: {
      employee_number: "EMP-0003",
      full_name: "John Employee",
      email: "employee@gmail.com",
      password,
      role: "USER",
      join_date: new Date(),
      department_id: department.id,
      position_id: positionStaff.id,
      salary: 8000000,
    },
  });

  /* =======================
   * 4. ALLOWANCES (MASTER)
   * ======================= */
  const transportAllowance = await prisma.allowances.create({
    data: {
      allowance: "Transport",
      description: "Transport allowance",
    },
  });

  const mealAllowance = await prisma.allowances.create({
    data: {
      allowance: "Meal",
      description: "Meal allowance",
    },
  });

  /* =======================
   * 5. DEDUCTIONS (MASTER)
   * ======================= */
  const bpjsDeduction = await prisma.deductions.create({
    data: {
      deduction: "BPJS",
      description: "BPJS Kesehatan & Ketenagakerjaan",
    },
  });

  const taxDeduction = await prisma.deductions.create({
    data: {
      deduction: "PPh21",
      description: "Income tax",
    },
  });

  /* =======================
   * 6. EMPLOYEE ALLOWANCES
   * ======================= */
  await prisma.employeeAllowances.create({
    data: {
      user_id: employee.id,
      allowance_id: transportAllowance.id,
      type: "MONTHLY",
      amount: 500000,
      effective_date: new Date(),
    },
  });

  await prisma.employeeAllowances.create({
    data: {
      user_id: employee.id,
      allowance_id: mealAllowance.id,
      type: "MONTHLY",
      amount: 300000,
      effective_date: new Date(),
    },
  });

  /* =======================
   * 7. EMPLOYEE DEDUCTIONS
   * ======================= */
  await prisma.employeeDeductions.create({
    data: {
      user_id: employee.id,
      deduction_id: bpjsDeduction.id,
      type: "MONTHLY",
      amount: 200000,
      effective_date: new Date(),
    },
  });

  await prisma.employeeDeductions.create({
    data: {
      user_id: employee.id,
      deduction_id: taxDeduction.id,
      type: "MONTHLY",
      amount: 300000,
      effective_date: new Date(),
    },
  });

    /* =======================
   * 8. PAYROLL
   * ======================= */

  // Hitung allowance
  const allowances = await prisma.employeeAllowances.findMany({
    where: { user_id: employee.id },
  });

  const allowanceAmount = allowances.reduce(
    (t, a) => t.plus(a.amount),
    new Prisma.Decimal(0)
  );

  // Hitung deduction
  const deductions = await prisma.employeeDeductions.findMany({
    where: { user_id: employee.id },
  });

  const deductionAmount = deductions.reduce(
    (t, d) => t.plus(d.amount),
    new Prisma.Decimal(0)
  );

  // Salary
  const salary = new Prisma.Decimal(employee.salary);

  // Net salary
  const net = salary.plus(allowanceAmount).minus(deductionAmount);

  await prisma.payroll.create({
    data: {
      ref_no: "PR-2024-0001",
      user_id: employee.id,

      date_from: new Date("2024-01-01"),
      date_to: new Date("2024-01-31"),

      type: "MONTHLY",
      status: "PENDING",

      salary: Number(salary),
      allowance_amount: Number(allowanceAmount),
      deductions: Number(deductionAmount),
      net,
    },
  });

  console.log("💰 Payroll created");

  console.log("✅ Seeding finished successfully");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
