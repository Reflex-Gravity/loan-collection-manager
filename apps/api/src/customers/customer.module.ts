import { Module } from '@nestjs/common';
import { Customer } from './customer.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { Case } from '../cases/entities/case.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Case])],
  controllers: [CustomerController],
  providers: [CustomerService],
})
export class CustomerModule {}
