import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
import ws from "ws";
import * as schema from "../shared/schema.js";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

let schemaInitialization: Promise<void> | null = null;

async function initializeDatabaseSchema(): Promise<void> {
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS profiles (
      id varchar PRIMARY KEY DEFAULT (gen_random_uuid())::text,
      name text NOT NULL DEFAULT '',
      title text NOT NULL DEFAULT '',
      bio text NOT NULL DEFAULT '',
      profile_image text,
      email text NOT NULL DEFAULT '',
      phone text NOT NULL DEFAULT '',
      location text NOT NULL DEFAULT '',
      github text,
      linkedin text,
      twitter text
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS projects (
      id varchar PRIMARY KEY DEFAULT (gen_random_uuid())::text,
      title text NOT NULL,
      description text NOT NULL,
      long_description text,
      image text,
      image_data text,
      tags text[] NOT NULL DEFAULT ARRAY[]::text[],
      live_url text,
      github_url text,
      "order" integer NOT NULL DEFAULT 0
    );
  `);
}

export async function ensureDatabaseSchema(): Promise<void> {
  if (!schemaInitialization) {
    schemaInitialization = initializeDatabaseSchema().catch((error) => {
      schemaInitialization = null;
      throw error;
    });
  }

  await schemaInitialization;
}
