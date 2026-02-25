import 'reflect-metadata';
import { AppDataSource } from './data-source';
import { Logger } from '@nestjs/common';

const logger = new Logger('Migrations');

AppDataSource.initialize()
  .then(async (dataSource) => {
    console.log(dataSource.options);
    logger.log('Running migrations...');
    const migrations = await dataSource.runMigrations();
    logger.log(`Ran ${migrations.length} migration(s)`);
    await dataSource.destroy();
    process.exit(0);
  })
  .catch((err: Error) => {
    logger.error('Migration failed:', err.message);
    process.exit(1);
  });
