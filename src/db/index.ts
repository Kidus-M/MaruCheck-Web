import { neon, Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { drizzle as drizzleWithPool } from "drizzle-orm/neon-serverless";
import * as schema from "@/db/schema";

export function createDatabase(databaseUrl: string) {
  const sql = neon(databaseUrl);
  return drizzle({ client: sql, schema });
}

export type MaruDatabase = ReturnType<typeof createDatabase>;

/** Use the WebSocket pool for short atomic writes; one-shot reads stay on Neon HTTP. */
export function createTransactionalDatabase(databaseUrl: string) {
  const pool = new Pool({ connectionString: databaseUrl });
  return {
    close: () => pool.end(),
    database: drizzleWithPool({ client: pool, schema }),
  };
}
