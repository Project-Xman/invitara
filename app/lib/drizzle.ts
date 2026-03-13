import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { env } from "./env";

// Connection pool tuned for serverless/edge: small max, short idle timeout
const client = postgres(env.DATABASE_URL, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  onnotice: () => {}, // suppress NOTICE messages
});

export const db = drizzle(client, { schema });
export type DB = typeof db;
