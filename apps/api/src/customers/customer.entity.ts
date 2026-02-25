import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Loan } from '../loan/loan.entity';
import { Case } from '../case/case.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Column()
  country!: string;

  @Column({ type: 'int', default: 1 })
  riskScore!: number;

  // relations
  @OneToMany(() => Loan, (loan) => loan.customer)
  loans!: Loan[];

  @OneToMany(() => Case, (caseIns) => caseIns.customer)
  cases!: Case[];
}
