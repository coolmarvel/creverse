import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Submission } from './submission.entity';
import { ResultStatus } from '../constants';

@Entity('submission_logs')
export class SubmissionLog {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  logId: string;

  @Column({ type: 'uuid' })
  submissionId: string;

  @ManyToOne(() => Submission, (s) => s.logs, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'submission_id' })
  submission: Submission;

  @Index()
  @Column({ type: 'varchar', length: 40 })
  step: string;

  @Column({ type: 'varchar', length: 60, nullable: true })
  externalService: string | null;

  @Column({ type: 'jsonb', nullable: true })
  requestPayload: Record<string, unknown> | null;

  @Column({ type: 'jsonb', nullable: true })
  responsePayload: Record<string, unknown> | null;

  @Column({
    type: 'enum',
    enum: ResultStatus,
    enumName: 'result_status',
    default: ResultStatus.OK,
  })
  status: ResultStatus;

  @Column({ type: 'integer', nullable: true })
  httpStatus: number | null;

  @Column({ type: 'integer', nullable: true })
  latencyMs: number | null;

  @Index()
  @Column({ type: 'varchar', length: 128, nullable: true })
  traceId: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
