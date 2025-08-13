import AppDataSource from '../data-source.ts';

await AppDataSource.initialize();
await AppDataSource.undoLastMigration({ transaction: 'all' });
await AppDataSource.destroy();
console.log('↩️  Last migration reverted');
