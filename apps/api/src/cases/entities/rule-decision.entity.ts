import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Case } from './case.entity';

@Entity('rule_decisions')
export class RuleDecision {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'case_id', type: 'int' })
  caseId!: number;

  @Column({ name: 'matched_rules', type: 'jsonb' })
  matchedRules!: string[];

  @Column({ type: 'text' })
  reason!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => Case, (caseIns) => caseIns.ruleDecisions)
  @JoinColumn({ name: 'case_id' })
  case!: Case;
}
