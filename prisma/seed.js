import { PrismaClient } from "@prisma/client";

import bcrypt from "bcrypt";

const prisma = new PrismaClient();
async function main() {
  await prisma.user.create({
    data: {
      "first_name": "",
      "last_name": "",
      "email": "",
      "password": "",
      "profile_uri": "",
      "role": "SUPER_ADMIN",
    },
  }),

  await prisma.department.create({
    data: {
      "name": "",
    },
  }),


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