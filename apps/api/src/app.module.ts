import { DbModule } from './db/db.module';
import { Module } from '@nestjs/common';

import { HealthController } from './health.controller';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { CaseModule } from './cases/cases.module';
import { CustomerModule } from './customers/customer.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    DbModule,
    ScheduleModule.forRoot(),
    CaseModule,
    CustomerModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
