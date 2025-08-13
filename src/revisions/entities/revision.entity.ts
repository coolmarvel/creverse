import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { RevisionStatus } from '../constants';
import { Submission } from '../../submissions/entities';

@Entity('revisions')
@Index('ix_revisions_submission_created', ['submissionId', 'createdAt'])
@Index('ix_revisions_status_created', ['status', 'createdAt'])
export class Revision {
  @PrimaryGeneratedColumn('uuid')
  revisionId: string;

  @Column({ type: 'uuid' })
  submissionId: string;

  @ManyToOne(() => Submission, (s) => s.revisions, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'submission_id' })
  submission: Submission;

  @Column({ type: 'varchar', length: 500, nullable: true })
  reason: string | null;

  @Column({
    type: 'enum',
    enum: RevisionStatus,
    enumName: 'revision_status',
    default: RevisionStatus.PENDING,
  })
  status: RevisionStatus;

  @Column({ type: 'smallint', nullable: true })
  score: number | null;

  @Column({ type: 'text', nullable: true })
  feedback: string | null;

  @Column({ type: 'jsonb', nullable: true })
  highlights: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  aiRaw: Record<string, unknown> | null;

  @Column({ type: 'integer', nullable: true })
  apiLatencyMs: number | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  traceId: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
