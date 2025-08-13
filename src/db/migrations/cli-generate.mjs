import { readdir } from 'fs/promises';
import { resolve } from 'path';
import { spawn } from 'child_process';

function run(cmd, args, opts = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32', ...opts });
    child.on('exit', (code) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`${cmd} ${args.join(' ')} exited with code ${code}`));
    });
    child.on('error', reject);
  });
}

async function main() {
  const baseName = process.argv[2] || 'InitSchema';
  const migrationsDir = resolve(process.cwd(), 'src/db/migrations');

  // 0) Ultra-simple guard: if any *-InitSchema.(ts|js) exists, skip creating another InitSchema
  if (baseName === 'InitSchema') {
    const files0 = await readdir(migrationsDir);
    const hasInitFile = files0.some((f) => /^\d+-InitSchema\.(ts|js)$/.test(f));
    if (hasInitFile) {
      console.log('[skip] InitSchema file already exists in migrations. Skipping generation.');
      process.exit(0);
    }
  }

  // 1) Generate migration with TypeORM CLI
  const args = ['typeorm-ts-node-commonjs', 'migration:generate', '-d', 'src/db/data-source.ts', `src/db/migrations/${baseName}`];
  await run('npx', args);

  console.log(`[done] Generated migration for ${baseName}.`);
  console.log('[next] Run: npm run db:migration:run');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
