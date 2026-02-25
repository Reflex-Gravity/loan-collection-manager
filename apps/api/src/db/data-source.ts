import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { Case } from '../cases/entities/case.entity';
import { Customer } from '../customers/customer.entity';
import { Loan } from '../loan/loan.entity';
import { ActionLog } from '../cases/entities/action-log.entity';
import { RuleDecision } from '../cases/entities/rule-decision.entity';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  synchronize: false,
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  entities: [Case, Customer, Loan, ActionLog, RuleDecision],
  logging: true,
});
