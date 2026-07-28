import { loadEnvConfig } from "@next/env";
import { defineConfig } from "prisma/config";

loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");

const MIGRATION_CONNECT_TIMEOUT = 30;

function migrationUrl() {
  const direct = process.env.DATABASE_URL_UNPOOLED;
  const url = direct || process.env.DATABASE_URL;

  if (!direct) {
    console.warn(
      "DATABASE_URL_UNPOOLED is not set — migrations will run over the pooled connection."
    );
  }

  if (!url || url.includes("connect_timeout")) return url;

  return `${url}${url.includes("?") ? "&" : "?"}connect_timeout=${MIGRATION_CONNECT_TIMEOUT}`;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: migrationUrl(),
  },
});
