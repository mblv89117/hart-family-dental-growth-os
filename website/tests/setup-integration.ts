import "dotenv/config";
import { execSync } from "child_process";
import path from "path";

process.env.OPS_ENABLED = "true";
process.env.AUTH_MODE = "local_credentials";
process.env.AUTH_PRODUCTION_APPROVED = "false";
process.env.AUTH_SECRET = "test-auth-secret-min-32-characters!!";
process.env.AUTOMATION_MODE = "draft";
process.env.OUTBOUND_COMMUNICATIONS_ENABLED = "false";
process.env.OPEN_DENTAL_MODE = "mock";
process.env.OPEN_DENTAL_WRITES_ENABLED = "false";
process.env.DATABASE_URL =
  process.env.DATABASE_URL_TEST ||
  "postgresql://hfd:hfd_local_dev@127.0.0.1:5432/hfd_growth_os_test?schema=public";
process.env.DIRECT_URL = process.env.DATABASE_URL;

const root = path.resolve(__dirname, "..");
execSync("npx prisma migrate deploy", {
  cwd: root,
  env: process.env,
  stdio: "inherit",
});
execSync("npx tsx prisma/seed.ts", {
  cwd: root,
  env: process.env,
  stdio: "inherit",
});
