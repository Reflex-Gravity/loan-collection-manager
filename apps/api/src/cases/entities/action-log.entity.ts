import { ActionOutcome, ActionType } from '@lcm/shared';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Case } from './case.entity';

@Entity('actions-logs')
export class ActionLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'case_id' })
  caseId!: number;

  @Column({ type: 'enum', enum: ActionType })
  type!: ActionType;

  @Column({ type: 'enum', enum: ActionOutcome })
  outcome!: ActionOutcome;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => Case, (caseIns) => caseIns.actionLogs)
  @JoinColumn({ name: 'case_id' })
  case!: Case;
}
