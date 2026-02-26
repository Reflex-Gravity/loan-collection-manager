import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PdfGeneratorService } from './pdf-generator.service';
import { Case } from '../cases/entities/case.entity';
import { ActionLog } from '../cases/entities/action-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Case, ActionLog])],
  providers: [PdfGeneratorService],
  exports: [PdfGeneratorService],
})
export class PdfGeneratorModule {}
