import AppDataSource from '../data-source.ts';

await AppDataSource.initialize();
await AppDataSource.runMigrations({ transaction: 'all' });
await AppDataSource.destroy();
console.log('✅ Migrations executed');
