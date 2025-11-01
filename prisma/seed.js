import { PrismaClient } from "@prisma/client";

import bcrypt from "bcrypt";

const prisma = new PrismaClient();
async function main() {
    await prisma.user.create({
    data: {
        email: "Admin@gmail.com",
        password: await bcrypt.hash("Password123.", await bcrypt.genSalt(10)),
        profile_uri: null
    },
})
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