import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateCaseDto } from './dto/create-case.dto';
import { CaseService } from './cases.service';

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
  findAll() {}
}
