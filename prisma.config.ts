import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Prisma v7 requires datasource.url here for migrate dev
    // Use DIRECT_URL for migrations (best for Supabase)
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
});
