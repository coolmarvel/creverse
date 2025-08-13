import AppDataSource from '../data-source.ts';
import { DataSource } from 'typeorm';

// Ensure enum types exist when generating against a non-empty DB
async function ensureEnumTypes(ds) {
  await ds.query(`DO $$ BEGIN
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
}

const name = process.argv[2] || 'InitSchema';
await AppDataSource.initialize();
await ensureEnumTypes(AppDataSource);
await AppDataSource.showMigrations();
await AppDataSource.runMigrations({ transaction: 'all' });
await AppDataSource.destroy();

console.log('[TIP] Use `npm run db:migration:run` after you add a real migration.');
console.log(`[NOTE] To generate with TypeORM CLI directly, use: npx typeorm-ts-node-commonjs migration:generate -d src/db/data-source.ts src/db/migrations/${name}`);
