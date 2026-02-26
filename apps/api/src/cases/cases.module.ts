import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Case } from './entities/case.entity';
import { ActionLog } from './entities/action-log.entity';
import { RuleDecision } from './entities/rule-decision.entity';
import { CasesController } from './cases.controller';
import { CaseService } from './cases.service';
import { Customer } from '../customers/customer.entity';
import { Loan } from '../loan/loan.entity';
import { RulesModule } from '../rules/rules.module';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Case, Customer, Loan, ActionLog, RuleDecision]),
    RulesModule,
  ],
  controllers: [CasesController],
  providers: [CaseService],
  exports: [CaseService],
})
export class CaseModule {}
