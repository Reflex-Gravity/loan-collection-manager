import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CreateCaseDto } from './dto/create-case.dto';
import { CaseService } from './cases.service';
import { ListCaseDto } from './dto/list-case.dto';
import { AddActionDto } from './dto/add-case-actions';
import { PdfGeneratorService } from '../pdf-generator/pdf-generator.service';

@ApiTags('cases')
@Controller('cases')
export class CasesController {
  constructor(
    private readonly caseService: CaseService,
    private pdfGeneratorService: PdfGeneratorService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a deliquency case' })
  @ApiResponse({ status: 201, description: 'Case created' })
  create(@Body() dto: CreateCaseDto) {
    return this.caseService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List cases with filters and pagination' })
  findAll(@Query() filters: ListCaseDto) {
    return this.caseService.findAll(filters);
  }

  @Get('kpis')
  @ApiOperation({ summary: 'Get KPI statistics' })
  getKpis() {
    return this.caseService.getKpis();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get case details' })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.caseService.findOne(id);
  }

  @Post(':id/actions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add action log to a case' })
  @ApiParam({ name: 'id', type: Number })
  addAction(@Param('id', ParseIntPipe) id: number, @Body() dto: AddActionDto) {
    return this.caseService.addAction(id, dto);
  }

  @Post(':id/assign')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Run rules-based assignment (idempotent)' })
  @ApiParam({ name: 'id', type: Number })
  assign(@Param('id', ParseIntPipe) id: number) {
    return this.caseService.assign(id);
  }

  @Get(':id/notice.pdf')
  @ApiOperation({ summary: 'Generate payment reminder PDF' })
  @ApiParam({ name: 'id', type: Number })
  async generateNotice(
    @Param('id', ParseIntPipe) id: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    const buffer = await this.pdfGeneratorService.generateNotice(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="notice-case-${id}.pdf"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}
