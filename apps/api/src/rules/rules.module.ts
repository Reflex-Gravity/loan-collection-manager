import { Module } from '@nestjs/common';
import { RulesService } from './rules.service';

@Module({
  providers: [RulesService],
  exports: [RulesService], // This is CRITICAL. It allows CasesModule to inject RulesService.
})
export class RulesModule {}
