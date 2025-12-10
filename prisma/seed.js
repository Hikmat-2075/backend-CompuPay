import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Start seeding...");

  // 1. Seed Department (pastikan minimal 1 departemen ada)
  let department = await prisma.department.findFirst();
  if (!department) {
    department = await prisma.department.create({
      data: {
        name: "Information Technology",
        start_salary: 5000000,
        end_salary: 20000000,
        description: "Handles IT infrastructure, systems, and internal software"
      },
    });
    console.log("➕ Department created");
  }

  // 2. Seed Position (wajib reference departmentId)
  let position = await prisma.position.findFirst();
  if (!position) {
    position = await prisma.position.create({
      data: {
        name: "System Administrator",
        departmentId: department.id
      },
    });
    console.log("➕ Position created");
  }

  // 3. Cek apakah Super Admin sudah ada
  const isUserExist = await prisma.user.findFirst({
    where: { email: "superadmin@example.com" },
  });

  if (!isUserExist) {
    const hashedPassword = await bcrypt.hash("admin123", 10);

    await prisma.user.create({
      data: {
        employee_number: "EMP-0001",
        first_name: "Super",
        last_name:  "Admin",
        email: "hikmatngrha@gmail.com",
        password: hashedPassword,
        role: "ADMIN",
        join_date: new Date(),
        departmentId: department.id,
        positionId: position.id,
        salary: 20000000, // bisa disesuaikan bebas
      },
    });

    console.log("👑 Super Admin user seeded");
  } else {
    console.log("ℹ Super Admin already exists, skipping");
  }

  console.log("🌱 Seeding finished.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
