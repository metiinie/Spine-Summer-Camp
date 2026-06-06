import path from "node:path";

export default {
  earlyAccess: true,
  schema: path.join("prisma", "schema.prisma"),
  migrate: {
    async adapter() {
      const { PrismaLibSQL } = await import("@prisma/adapter-libsql");
      const { createClient } = await import("@libsql/client");
      const client = createClient({
        url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
      });
      return new PrismaLibSQL(client);
    },
  },
};
