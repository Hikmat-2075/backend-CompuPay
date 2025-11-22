import { PrismaClient } from "@prisma/client";

import bcrypt from "bcrypt";

const prisma = new PrismaClient();
async function main() {
    await prisma.user.create({
      data: {
          email: "Admin@gmail.com",
          password: await bcrypt.hash("Password123.", await bcrypt.genSalt(10)),
          profile_uri: null
      },
    })

    await prisma.karyawan.create({
    data: {
      nama_lengkap: "Budi Santoso",
      nik: "KRY-001",
      email: "budi.santoso@company.com",
      password: await bcrypt.hash("Password123.", 10),
      jabatan: "Staff",
      departemen: "Keuangan",
      nomor_telepon: "08123456789",
      alamat: "Bandung",
      tanggal_lahir: new Date("1998-05-21"),
      status_kerja: "KONTRAK",
      gaji_pokok: 4500000,
    },
  });

console.log("Succes");
};


main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
});