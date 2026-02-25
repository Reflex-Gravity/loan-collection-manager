import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerService } from './customer.service';

@ApiTags('customers')
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  @ApiOperation({ summary: 'List all customers' })
  findAll() {
    return this.customerService.findAll();
  }
  @Get(':id')
  @ApiOperation({ summary: 'Get customer details' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.customerService.findOne(id);
  }
}
