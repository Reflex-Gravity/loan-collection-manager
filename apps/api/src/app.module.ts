import { Module } from '@nestjs/common';

import { HealthController } from './health.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.getOrThrow('database.host'),
        port: config.getOrThrow('database.port'),
        username: config.getOrThrow('database.username'),
        password: config.getOrThrow('database.password'),
        database: config.getOrThrow('database.database'),
        synchronize: config.getOrThrow('database.synchronize'),
        autoLoadEntities: true,
        entities: ['dist/**/*.entity{.ts,.js}'],
        migrations: ['dist/migrations/*{.ts,.js}'],
        migrationsRun: true,
        ssl:
          process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
        extra: {
          max: 20,
          idleTimeoutMillis: 30000,
        },
      }),
    }),
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
