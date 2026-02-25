import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCaseDto } from './dto/create-case.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Case } from './entities/case.entity';
import { Between, Repository } from 'typeorm';
import { Loan } from '../loan/loan.entity';
import { ListCaseDto } from './dto/list-case.dto';
import { AddActionDto } from './dto/add-case-actions';
import { ActionOutcome, CaseStatus } from '@lcm/shared';
import { ActionLog } from './entities/action-log.entity';
import { RuleDecision } from './entities/rule-decision.entity';

@Injectable()
export class CaseService {
  constructor(
    @InjectRepository(Case)
    private readonly caseRespository: Repository<Case>,
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    @InjectRepository(ActionLog)
    private readonly actionLogRepository: Repository<ActionLog>,
    @InjectRepository(RuleDecision)
    private readonly ruleDecisionRepository: Repository<RuleDecision>,
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

  async findAll(filters: ListCaseDto) {
    const {
      page = 1,
      limit = 20,
      //   sortBy = 'createdAt',
      sortOrder = 'desc',
      ...otherFilters
    } = filters;

    const skip = (page - 1) * limit;

    const qb = this.caseRespository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.customer', 'customer')
      .leftJoinAndSelect('c.loan', 'loan');

    if (otherFilters.status) {
      qb.andWhere('c.status = :status', { status: otherFilters.status });
    }
    if (otherFilters.stage) {
      qb.andWhere('c.stage = :stage', { stage: otherFilters.stage });
    }
    if (otherFilters.assignedTo) {
      qb.andWhere('c.assignedTo = :assignedTo', {
        assignedTo: otherFilters.assignedTo,
      });
    }
    if (otherFilters.dpdMin !== undefined)
      qb.andWhere('c.dpd >= :dpdMin', { dpdMin: otherFilters.dpdMin });
    if (otherFilters.dpdMax !== undefined)
      qb.andWhere('c.dpd <= :dpdMax', { dpdMax: otherFilters.dpdMax });

    qb.orderBy('c.createdAt', sortOrder.toUpperCase() as 'ASC' | 'DESC');
    qb.skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const caseRecord = await this.caseRespository.findOne({
      where: { id: id },
      relations: { customer: true, loan: true },
    });

    if (!caseRecord) {
      throw new NotFoundException(`Case not found`);
    }

    const [actionLogs, rule_decisions] = await Promise.all([
      this.actionLogRepository.find({
        where: { caseId: id },
        order: { createdAt: 'DESC' },
        take: 10,
      }),
      this.ruleDecisionRepository.find({
        where: { caseId: id },
        order: { createdAt: 'DESC' },
        take: 1,
      }),
    ]);

    return { ...caseRecord, actionLogs, decisions: rule_decisions };
  }

  async addAction(caseId: number, dto: AddActionDto) {
    const caseRecord = await this.caseRespository.findOne({
      where: { id: caseId },
      relations: { customer: true, loan: true },
    });

    if (!caseRecord) {
      throw new NotFoundException(`Case not found`);
    }

    let newStatus: CaseStatus | undefined;
    if (caseRecord.status == CaseStatus.OPEN) {
      newStatus = CaseStatus.IN_PROGRESS;
    }

    if (dto.outcome === ActionOutcome.PAID) {
      newStatus = CaseStatus.RESOLVED;
    }

    const actionLog = await this.caseRespository.manager.transaction(
      async (manager) => {
        const log = manager.create(ActionLog, {
          caseId,
          type: dto.type,
          outcome: dto.outcome,
          notes: dto.notes ?? null,
        });

        await manager.save(log);
        if (newStatus) {
          await manager.update(Case, { id: caseId }, { status: newStatus });
        }

        return log;
      },
    );

    return actionLog;
  }

  async getKpis() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const [openCases, resolvedToday, averageDpd] = await Promise.all([
      this.caseRespository.count({ where: { status: CaseStatus.OPEN } }),
      this.caseRespository.count({
        where: {
          status: CaseStatus.RESOLVED,
          updatedAt: Between(today, tomorrow),
        },
      }),
      this.caseRespository
        .createQueryBuilder('c')
        .select('AVG(c.dpd)', 'avg')
        .where('c.status IN (:...statuses)', {
          statuses: [CaseStatus.OPEN, CaseStatus.IN_PROGRESS],
        })
        .getRawOne<{ avg: string | null }>(),
    ]);

    return {
      openCases,
      resolvedToday,
      averageDpd: Math.round(Number(averageDpd?.avg ?? 0)),
    };
  }
}
