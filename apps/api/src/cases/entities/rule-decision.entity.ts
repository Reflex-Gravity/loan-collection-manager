import { Column, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Case } from './case.entity';

export class RuleDecision {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'case_id' })
  caseId!: number;

  @ManyToOne(() => Case, (caseIns) => caseIns.ruleDecisions)
  @JoinColumn({ name: 'case_id' })
  case!: Case;
}
