import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Case } from './entities/case.entity';
import { ActionLog } from './entities/action-log.entity';
import { RuleDecision } from './entities/rule-decision.entity';
import { CasesController } from './cases.controller';
import { CaseService } from './cases.service';

@Module({
  imports: [TypeOrmModule.forFeature([Case, ActionLog, RuleDecision])],
  controllers: [CasesController],
  providers: [CaseService],
  exports: [CaseService],
})
export class CaseModule {}
