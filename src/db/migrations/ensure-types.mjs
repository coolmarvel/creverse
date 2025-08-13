import 'dotenv/config';
import { Client } from 'pg';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('[ensure-types] DATABASE_URL is not set');
    process.exit(0);
  }
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    await client.query(`DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'revision_status') THEN
        CREATE TYPE "public"."revision_status" AS ENUM ('PENDING','PROCESSING','SUCCESS','FAILED');
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'submission_status') THEN
        CREATE TYPE "public"."submission_status" AS ENUM ('PENDING','PROCESSING','SUCCESS','FAILED','RETRY_SCHEDULED');
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'result_status') THEN
        CREATE TYPE "public"."result_status" AS ENUM ('ok','failed');
      END IF;
    END $$;`);
    console.log('[ensure-types] ensured enum types exist');
  } catch (e) {
    console.error('[ensure-types] error', e?.message || e);
  } finally {
    await client.end();
  }
}

main();


