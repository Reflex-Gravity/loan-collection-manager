import {
  ActionOutcome,
  ActionType,
  CaseStage,
  CaseStatus,
  LoanStatus,
} from '@lcm/shared';
import { ActionLog } from '../cases/entities/action-log.entity';
import { Case } from '../cases/entities/case.entity';
import { Customer } from '../customers/customer.entity';
import { Loan } from '../loan/loan.entity';
import { AppDataSource } from './data-source';

async function seed() {
  console.log('Starting Seed...');
  await AppDataSource.initialize();
  console.log('Database connected.');

  const customerRepo = AppDataSource.getRepository(Customer);
  const loanRepo = AppDataSource.getRepository(Loan);
  const caseRepo = AppDataSource.getRepository(Case);
  const actionRepo = AppDataSource.getRepository(ActionLog);

  console.log('Truncating tables...');
  await AppDataSource.query(
    'TRUNCATE TABLE rule_decisions, action_logs, cases, loans, customers RESTART IDENTITY CASCADE',
  );

  console.log('Seeding customers...');
  const customers = await customerRepo.save([
    {
      name: 'Alice Johnson',
      phone: '+1-555-0101',
      email: 'alice@example.com',
      country: 'US',
      riskScore: 25,
    },
    {
      name: 'Bob Martinez',
      phone: '+1-555-0102',
      email: 'bob@example.com',
      country: 'US',
      riskScore: 65,
    },
    {
      name: 'Carol Williams',
      phone: '+1-555-0103',
      email: 'carol@example.com',
      country: 'CA',
      riskScore: 85,
    },
    {
      name: 'David Lee',
      phone: '+1-555-0104',
      email: 'david@example.com',
      country: 'US',
      riskScore: 92,
    },
    {
      name: 'Emma Brown',
      phone: '+1-555-0105',
      email: 'emma@example.com',
      country: 'UK',
      riskScore: 45,
    },
  ]);

  const now = new Date();
  const daysAgo = (n: number) =>
    new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

  console.log('Seeding loans...');
  const loans = await loanRepo.save([
    {
      customerId: customers[0].id,
      principal: 5000,
      outstanding: 4800,
      dueDate: daysAgo(3),
      status: LoanStatus.ACTIVE,
    },
    {
      customerId: customers[1].id,
      principal: 10000,
      outstanding: 9500,
      dueDate: daysAgo(15),
      status: LoanStatus.ACTIVE,
    },
    {
      customerId: customers[2].id,
      principal: 25000,
      outstanding: 22000,
      dueDate: daysAgo(45),
      status: LoanStatus.ACTIVE,
    },
    {
      customerId: customers[3].id,
      principal: 15000,
      outstanding: 14000,
      dueDate: daysAgo(10),
      status: LoanStatus.ACTIVE,
    },
    {
      customerId: customers[4].id,
      principal: 8000,
      outstanding: 7500,
      dueDate: daysAgo(60),
      status: LoanStatus.ACTIVE,
    },
    {
      customerId: customers[0].id,
      principal: 3000,
      outstanding: 2800,
      dueDate: daysAgo(5),
      status: LoanStatus.ACTIVE,
    },
  ]);

  console.log('Seeding cases...');
  const cases = await caseRepo.save([
    {
      customerId: customers[0].id,
      loanId: loans[0].id,
      dpd: 3,
      stage: CaseStage.SOFT,
      status: CaseStatus.OPEN,
    },
    {
      customerId: customers[1].id,
      loanId: loans[1].id,
      dpd: 15,
      stage: CaseStage.HARD,
      status: CaseStatus.IN_PROGRESS,
      assignedTo: 'agent_2',
      assignGroup: 'Tier2',
    },
    {
      customerId: customers[2].id,
      loanId: loans[2].id,
      dpd: 45,
      stage: CaseStage.LEGAL,
      status: CaseStatus.IN_PROGRESS,
      assignedTo: 'SeniorAgent',
      assignGroup: 'Legal',
    },
    {
      customerId: customers[3].id,
      loanId: loans[3].id,
      dpd: 10,
      stage: CaseStage.HARD,
      status: CaseStatus.OPEN,
      assignGroup: 'Tier2',
    },
    {
      customerId: customers[4].id,
      loanId: loans[4].id,
      dpd: 60,
      stage: CaseStage.LEGAL,
      status: CaseStatus.OPEN,
      assignGroup: 'Legal',
    },
    {
      customerId: customers[0].id,
      loanId: loans[5].id,
      dpd: 5,
      stage: CaseStage.SOFT,
      status: CaseStatus.RESOLVED,
      assignedTo: 'agent_1',
      assignGroup: 'Tier1',
    },
  ]);

  console.log('Seeding action logs...');
  await actionRepo.save([
    {
      caseId: cases[1].id,
      type: ActionType.CALL,
      outcome: ActionOutcome.NO_ANSWER,
      notes: 'Called at 10am, no answer',
    },
    {
      caseId: cases[1].id,
      type: ActionType.SMS,
      outcome: ActionOutcome.PROMISE_TO_PAY,
      notes: 'Customer replied, promised to pay by Friday',
    },
    {
      caseId: cases[2].id,
      type: ActionType.EMAIL,
      outcome: ActionOutcome.NO_ANSWER,
      notes: 'Sent payment demand letter',
    },
    {
      caseId: cases[2].id,
      type: ActionType.CALL,
      outcome: ActionOutcome.WRONG_NUMBER,
      notes: 'Number appears disconnected',
    },
    {
      caseId: cases[5].id,
      type: ActionType.CALL,
      outcome: ActionOutcome.PAID,
      notes: 'Customer paid full outstanding amount',
    },
  ]);

  console.log(
    `Seed complete: ${customers.length} customers, ${loans.length} loans, ${cases.length} cases`,
  );
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
