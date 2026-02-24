import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig], // Pass your custom config file here
    }),
    TypeOrmModule.forRoot(databaseConfig() as TypeOrmModuleOptions),
  ],
  controllers: [HealthController],
  providers: [AppService],
})
export class AppModule {}
