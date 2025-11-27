import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {

  // === 1. CREATE SUPER ADMIN USER ===
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

  // === 2. CREATE DEPARTMENT ===
  const department = await prisma.department.create({
    data: {
      name: "IT Department",
      start_salary: 6000000,
      end_salary: 15000000,
    },
  });

  // === 3. CREATE POSITION + LEVEL ===
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
    include: { levels: true },
  });

  // === 4. CREATE ALLOWANCES ===
  const allowance = await prisma.allowances.create({
    data: {
      allowance: "Meal Allowance",
      description: "Allowance for daily meals"
    },
  });

  // === 5. CREATE DEDUCTIONS ===
  const deduction = await prisma.deductions.create({
    data: {
      deduction: "Late Penalty",
      description: "Penalty for late attendance"
    },
  });

  // === 6. OPTIONAL: CREATE EMPLOYEE ===
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
    }
  });
  console.log("🚀 Seed completed successfully");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
