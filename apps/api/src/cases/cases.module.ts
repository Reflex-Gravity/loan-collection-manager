import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Case } from './entities/case.entity';
import { ActionLog } from './entities/action-log.entity';
import { RuleDecision } from './entities/rule-decision.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Case, ActionLog, RuleDecision])],
})
export class CaseModule {}
