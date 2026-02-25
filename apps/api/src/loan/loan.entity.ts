import { LoanStatus } from '@lcm/shared';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Customer } from '../customers/customer.entity';
import { Case } from '../cases/entities/case.entity';

@Entity('loan')
export class Loan {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'customer_id' })
  customerId!: number;

  @Column({ type: 'decimal', scale: 2, precision: 10 })
  principal!: number;

  @Column({ type: 'decimal', scale: 2, precision: 10 })
  outstanding!: number;

  @Column({ name: 'due_date', type: 'timestamptz' })
  dueDate!: Date;

  @Column({ type: 'enum', enum: LoanStatus, default: LoanStatus.ACTIVE })
  status!: LoanStatus;

  // relations
  @ManyToOne(() => Customer, (customer) => customer.loans)
  @JoinColumn({ name: 'customer_id' })
  customer!: Customer;

  @OneToMany(() => Case, (caseIns) => caseIns.loan)
  cases!: Case[];
}
