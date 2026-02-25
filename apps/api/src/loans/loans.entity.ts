import { LoanStatus } from '@lcm/shared';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('loans')
export class Loans {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  customerId!: number;

  @Column({ type: 'decimal', scale: 2, precision: 10 })
  principal!: number;

  @Column({ type: 'decimal', scale: 2, precision: 10 })
  outstanding!: number;

  @Column({ name: 'due_date', type: 'timestamptz' })
  dueDate!: Date;

  @Column()
  status!: LoanStatus;
}
