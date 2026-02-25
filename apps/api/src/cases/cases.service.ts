import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCaseDto } from './dto/create-case.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Case } from './entities/case.entity';
import { Repository } from 'typeorm';
import { Loan } from '../loan/loan.entity';

@Injectable()
export class CaseService {
  constructor(
    @InjectRepository(Case)
    private readonly caseRespository: Repository<Case>,
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
  ) {}

  async create(dto: CreateCaseDto) {
    const customer = await this.caseRespository.findOne({
      where: { id: dto.customerId },
    });

    // validate if customer and loan exists
    if (!customer)
      throw new NotFoundException(
        `Customer with ${dto.customerId} customerId not found`,
      );

    const loan = await this.loanRepository.findOne({
      where: { id: dto.loanId },
    });
    if (!loan)
      throw new NotFoundException(`Loan with ${dto.loanId} loanId not found`);

    // validate if loan matches the customer
    if (loan.customerId !== dto.customerId) {
      throw new BadRequestException(`Loan doesn't belong to the customer`);
    }

    // const dpd =
    this.caseRespository.create({
      customerId: dto.customerId,
      loanId: dto.loanId,
      dpd: 7,
    });
  }
}
