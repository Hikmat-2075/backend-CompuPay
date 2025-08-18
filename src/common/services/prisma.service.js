// prisma.service.js
import { PrismaClient } from "@prisma/client";
import { createSoftDeleteMiddleware } from "prisma-soft-delete-middleware";

export class PrismaService extends PrismaClient {
  constructor() {
    super();
  }

  async onModuleInit() {
    this.$use(
      createSoftDeleteMiddleware({
        models: {
          Otp: true,
          User: true,
        },
        defaultConfig: {
          field: "deleted_at",
          createValue: (deleted) => (deleted ? new Date() : null),
        },
      }),
    );

    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
