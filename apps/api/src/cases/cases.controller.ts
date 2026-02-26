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
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateCaseDto } from './dto/create-case.dto';
import { CaseService } from './cases.service';
import { ListCaseDto } from './dto/list-case.dto';
import { AddActionDto } from './dto/add-case-actions';

@ApiTags('cases')
@Controller('cases')
export class CasesController {
  constructor(private readonly caseService: CaseService) {}

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
}
