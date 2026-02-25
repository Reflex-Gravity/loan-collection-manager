import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Customer } from '../../customers/customer.entity';
import { Loan } from '../../loan/loan.entity';
import { CaseStage, CaseStatus } from '@lcm/shared';
import { ActionLog } from './action-log.entity';
import { RuleDecision } from './rule-decision.entity';

@Entity('case')
export class Case {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'customer_id' })
  customerId!: number;

  @Column({ name: 'loan_id' })
  loanId!: number;

  @Column({ type: 'int', default: 0 })
  dpd!: number;

  @Column('enum', { enum: CaseStage, default: CaseStage.SOFT })
  stage!: CaseStage;

  @Column('enum', { enum: CaseStatus, default: CaseStatus.OPEN })
  status!: CaseStatus;

  @Column({ name: 'assigned_to', nullable: true })
  assignedTo!: string;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  // relations
  @ManyToOne(() => Customer, (customer) => customer.cases)
  @JoinColumn({ name: 'customer_id' })
  customer!: Customer;

  @ManyToOne(() => Loan, (loan) => loan.cases)
  @JoinColumn({ name: 'loan_id' })
  loan!: Loan;

  @OneToMany(() => ActionLog, (actionLog) => actionLog.case)
  actionLogs!: ActionLog[];

  @OneToMany(() => RuleDecision, (rule) => rule.case)
  ruleDecisions!: RuleDecision[];
}
