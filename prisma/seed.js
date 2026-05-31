import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Start seeding...");

  /* =======================
   * 0. CLEAN OLD DATA
   * ======================= */
  console.log("🧹 Cleaning old data...");

  await prisma.pointRecord.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.payroll.deleteMany();
  await prisma.employeeAllowances.deleteMany();
  await prisma.employeeDeductions.deleteMany();
  await prisma.allowances.deleteMany();
  await prisma.deductions.deleteMany();
  await prisma.user.deleteMany();
  await prisma.position.deleteMany();
  await prisma.department.deleteMany();

  /* =======================
   * 1. DEPARTMENTS
   * ======================= */
  const departmentIT = await prisma.department.create({
    data: {
      name: "Information Technology",
      start_salary: 5000000,
      end_salary: 20000000,
      description: "Handles IT infrastructure, software, and internal systems",
    },
  });

  const departmentHR = await prisma.department.create({
    data: {
      name: "Human Resource",
      start_salary: 4500000,
      end_salary: 18000000,
      description:
        "Handles recruitment, employee relations, and payroll administration",
    },
  });

  /* =======================
   * 2. POSITIONS
   * ======================= */
  const positionSuperAdmin = await prisma.position.create({
    data: {
      name: "System Administrator",
      department_id: departmentIT.id,
    },
  });

  const positionHR = await prisma.position.create({
    data: {
      name: "HR Manager",
      department_id: departmentHR.id,
    },
  });

  const positionStaff = await prisma.position.create({
    data: {
      name: "Staff",
      department_id: departmentIT.id,
    },
  });

  const positionDeveloper = await prisma.position.create({
    data: {
      name: "Backend Developer",
      department_id: departmentIT.id,
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
      status: "ACTIVE",
      join_date: new Date("2024-01-01"),
      department_id: departmentIT.id,
      position_id: positionSuperAdmin.id,
      salary: 20000000,
    },
  });

  const admin = await prisma.user.create({
    data: {
      employee_number: "EMP-0002",
      full_name: "HR Admin",
      email: "hr@gmail.com",
      password,
      role: "ADMIN",
      status: "ACTIVE",
      join_date: new Date("2024-01-05"),
      department_id: departmentHR.id,
      position_id: positionHR.id,
      salary: 15000000,
    },
  });

  const employeeOne = await prisma.user.create({
    data: {
      employee_number: "EMP-0003",
      full_name: "John Employee",
      email: "employee@gmail.com",
      password,
      role: "USER",
      status: "ACTIVE",
      join_date: new Date("2024-02-01"),
      department_id: departmentIT.id,
      position_id: positionStaff.id,
      salary: 8000000,
    },
  });

  const employeeTwo = await prisma.user.create({
    data: {
      employee_number: "EMP-0004",
      full_name: "Jane Developer",
      email: "jane@gmail.com",
      password,
      role: "USER",
      status: "ACTIVE",
      join_date: new Date("2024-02-15"),
      department_id: departmentIT.id,
      position_id: positionDeveloper.id,
      salary: 10000000,
    },
  });

  const inactiveEmployee = await prisma.user.create({
    data: {
      employee_number: "EMP-0005",
      full_name: "Inactive Employee",
      email: "inactive@gmail.com",
      password,
      role: "USER",
      status: "INACTIVE",
      join_date: new Date("2024-03-01"),
      department_id: departmentHR.id,
      position_id: positionStaff.id,
      salary: 6000000,
    },
  });

  console.log("👥 Users created");

  /* =======================
   * 4. ALLOWANCES MASTER
   * ======================= */
  const transportAllowance = await prisma.allowances.create({
    data: {
      allowance: "Transport",
      description: "Monthly transport allowance",
    },
  });

  const mealAllowance = await prisma.allowances.create({
    data: {
      allowance: "Meal",
      description: "Monthly meal allowance",
    },
  });

  const internetAllowance = await prisma.allowances.create({
    data: {
      allowance: "Internet",
      description: "Internet support allowance",
    },
  });

  /* =======================
   * 5. DEDUCTIONS MASTER
   * ======================= */
  const bpjsDeduction = await prisma.deductions.create({
    data: {
      deduction: "BPJS",
      description: "BPJS Kesehatan and Ketenagakerjaan",
    },
  });

  const taxDeduction = await prisma.deductions.create({
    data: {
      deduction: "PPh21",
      description: "Income tax deduction",
    },
  });

  const lateDeduction = await prisma.deductions.create({
    data: {
      deduction: "Late Penalty",
      description: "Penalty for late attendance",
    },
  });

  console.log("💸 Allowances and deductions master created");

  /* =======================
   * 6. EMPLOYEE ALLOWANCES
   * ======================= */
  await prisma.employeeAllowances.createMany({
    data: [
      {
        user_id: employeeOne.id,
        allowance_id: transportAllowance.id,
        type: "MONTHLY",
        amount: 500000,
        effective_date: new Date("2024-02-01"),
      },
      {
        user_id: employeeOne.id,
        allowance_id: mealAllowance.id,
        type: "MONTHLY",
        amount: 300000,
        effective_date: new Date("2024-02-01"),
      },
      {
        user_id: employeeTwo.id,
        allowance_id: transportAllowance.id,
        type: "MONTHLY",
        amount: 600000,
        effective_date: new Date("2024-02-15"),
      },
      {
        user_id: employeeTwo.id,
        allowance_id: internetAllowance.id,
        type: "MONTHLY",
        amount: 250000,
        effective_date: new Date("2024-02-15"),
      },
    ],
  });

  /* =======================
   * 7. EMPLOYEE DEDUCTIONS
   * ======================= */
  await prisma.employeeDeductions.createMany({
    data: [
      {
        user_id: employeeOne.id,
        deduction_id: bpjsDeduction.id,
        type: "MONTHLY",
        amount: 200000,
        effective_date: new Date("2024-02-01"),
      },
      {
        user_id: employeeOne.id,
        deduction_id: taxDeduction.id,
        type: "MONTHLY",
        amount: 300000,
        effective_date: new Date("2024-02-01"),
      },
      {
        user_id: employeeTwo.id,
        deduction_id: bpjsDeduction.id,
        type: "MONTHLY",
        amount: 250000,
        effective_date: new Date("2024-02-15"),
      },
      {
        user_id: employeeTwo.id,
        deduction_id: lateDeduction.id,
        type: "MONTHLY",
        amount: 100000,
        effective_date: new Date("2024-02-15"),
      },
    ],
  });

  console.log("🧾 Employee allowances and deductions created");

  /* =======================
   * 8. ATTENDANCE + POINT RECORD
   * ======================= */

  // Employee One: CHECK_IN before 09:00, point +1
  const employeeOneCheckIn = await prisma.attendance.create({
    data: {
      employeeId: employeeOne.id,
      type: "CHECK_IN",
      status: "ON_TIME",
      datetime_log: new Date("2024-05-01T08:30:00+07:00"),
      latitude: -6.2,
      longitude: 106.8,
      accuracy: 10,
      photo_url: "assets/attendance/seed-checkin-employee-one.jpg",
    },
  });

  await prisma.pointRecord.create({
    data: {
      attendanceId: employeeOneCheckIn.id,
      point: 1,
    },
  });

  // Employee One: CHECK_OUT, no point record
  await prisma.attendance.create({
    data: {
      employeeId: employeeOne.id,
      type: "CHECK_OUT",
      status: "ON_TIME",
      datetime_log: new Date("2024-05-01T17:10:00+07:00"),
      latitude: -6.2,
      longitude: 106.8,
      accuracy: 10,
      photo_url: "assets/attendance/seed-checkout-employee-one.jpg",
    },
  });

  // Employee Two: CHECK_IN after 09:00, point 0
  const employeeTwoCheckIn = await prisma.attendance.create({
    data: {
      employeeId: employeeTwo.id,
      type: "CHECK_IN",
      status: "LATE",
      datetime_log: new Date("2024-05-01T09:15:00+07:00"),
      latitude: -6.2,
      longitude: 106.8,
      accuracy: 12,
      photo_url: "assets/attendance/seed-checkin-employee-two.jpg",
    },
  });

  await prisma.pointRecord.create({
    data: {
      attendanceId: employeeTwoCheckIn.id,
      point: 0,
    },
  });

  // Employee Two: CHECK_OUT, no point record
  await prisma.attendance.create({
    data: {
      employeeId: employeeTwo.id,
      type: "CHECK_OUT",
      status: "EARLY",
      datetime_log: new Date("2024-05-01T16:30:00+07:00"),
      latitude: -6.2,
      longitude: 106.8,
      accuracy: 12,
      photo_url: "assets/attendance/seed-checkout-employee-two.jpg",
    },
  });

  console.log("🕘 Attendance and point records created");

  /* =======================
   * 9. LEAVE REQUEST
   * ======================= */
  await prisma.leaveRequest.create({
    data: {
      user_id: employeeOne.id,
      type: "CUTI",
      startDate: new Date("2024-05-10"),
      endDate: new Date("2024-05-12"),
      reason: "Family event",
      attachment: "assets/leave-request/seed-leave-request.pdf",
      status: "PENDING",
    },
  });

  await prisma.leaveRequest.create({
    data: {
      user_id: employeeTwo.id,
      type: "SAKIT",
      startDate: new Date("2024-05-15"),
      endDate: new Date("2024-05-16"),
      reason: "Medical recovery",
      attachment: "assets/leave-request/seed-medical-letter.pdf",
      status: "APPROVED",
    },
  });

  console.log("📝 Leave requests created");

  /* =======================
   * 10. PAYROLL
   * ======================= */
  async function createPayrollForEmployee(employee, refNo, dateFrom, dateTo) {
    const allowances = await prisma.employeeAllowances.findMany({
      where: { user_id: employee.id },
    });

    const allowanceAmount = allowances.reduce(
      (total, item) => total.plus(item.amount),
      new Prisma.Decimal(0),
    );

    const deductions = await prisma.employeeDeductions.findMany({
      where: { user_id: employee.id },
    });

    const deductionAmount = deductions.reduce(
      (total, item) => total.plus(item.amount),
      new Prisma.Decimal(0),
    );

    const salary = new Prisma.Decimal(employee.salary);
    const net = salary.plus(allowanceAmount).minus(deductionAmount);

    return prisma.payroll.create({
      data: {
        ref_no: refNo,
        user_id: employee.id,
        date_from: new Date(dateFrom),
        date_to: new Date(dateTo),
        type: "MONTHLY",
        status: "PENDING",
        salary,
        allowance_amount: allowanceAmount,
        deductions: deductionAmount,
        net,
      },
    });
  }

  await createPayrollForEmployee(
    employeeOne,
    "PR-2024-0001",
    "2024-05-01",
    "2024-05-31",
  );

  await createPayrollForEmployee(
    employeeTwo,
    "PR-2024-0002",
    "2024-05-01",
    "2024-05-31",
  );

  const employeeOneSalary = new Prisma.Decimal(employeeOne.salary);
  const employeeOnePaidAllowance = new Prisma.Decimal(800000);
  const employeeOnePaidDeduction = new Prisma.Decimal(500000);
  const employeeOnePaidNet = employeeOneSalary
    .plus(employeeOnePaidAllowance)
    .minus(employeeOnePaidDeduction);

  await prisma.payroll.create({
    data: {
      ref_no: "PR-2024-0003",
      user_id: employeeOne.id,
      date_from: new Date("2024-06-01"),
      date_to: new Date("2024-06-30"),
      type: "MONTHLY",
      status: "PAID",
      salary: employeeOneSalary,
      allowance_amount: employeeOnePaidAllowance,
      deductions: employeeOnePaidDeduction,
      net: employeeOnePaidNet,
      paid_at: new Date("2024-07-01T10:00:00+07:00"),
      paid_by: admin.id,
    },
  });

  console.log("💰 Payroll created");

  /* =======================
   * DONE
   * ======================= */
  console.log("");
  console.log("✅ Seeding finished successfully");
  console.log("");
  console.log("🔐 Login accounts:");
  console.log("SUPER_ADMIN : superadmin@gmail.com / admin123");
  console.log("ADMIN       : hr@gmail.com / admin123");
  console.log("USER 1      : employee@gmail.com / admin123");
  console.log("USER 2      : jane@gmail.com / admin123");
  console.log("INACTIVE    : inactive@gmail.com / admin123");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
