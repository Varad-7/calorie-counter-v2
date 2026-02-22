import { defineConfig } from "prisma/config";
import path from "node:path";
import dotenv from "dotenv";

// Load .env.local for Next.js compatibility
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"]!,
    directUrl: process.env["DIRECT_URL"],
  },
});
