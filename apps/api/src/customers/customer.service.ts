import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from './customer.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async findAll() {
    const customers = await this.customerRepository.find({
      relations: { loans: true },
    });
    return customers;
  }

  async findOne(customerId: number) {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
      relations: { loans: true },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // const cases = await this.c
    return customer;
  }
}
