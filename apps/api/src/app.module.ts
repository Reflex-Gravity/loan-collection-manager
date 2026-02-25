import { DbModule } from './db/db.module';
import { Module } from '@nestjs/common';

import { HealthController } from './health.controller';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { CaseModule } from './cases/cases.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    DbModule,
    // CaseModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
