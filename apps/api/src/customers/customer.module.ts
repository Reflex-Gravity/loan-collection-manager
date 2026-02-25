import { Module } from '@nestjs/common';
import { Customer } from './customer.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerController } from './customer.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  controllers: [CustomerController],
})
export class CustomerModule {}
