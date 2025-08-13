import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Submission } from './submission.entity';

@Entity('submission_media')
export class SubmissionMedia {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  mediaId: string;

  @Column({ type: 'uuid' })
  submissionId: string;

  @OneToOne(() => Submission, (s) => s.media, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'submission_id' })
  submission: Submission;

  @Column({ type: 'text', nullable: true })
  videoUrl: string | null;

  @Column({ type: 'text', nullable: true })
  audioUrl: string | null;

  @Column({ type: 'integer', nullable: true })
  videoDurationSec: number | null;

  @Column({ type: 'integer', nullable: true })
  audioDurationSec: number | null;

  @Column({ type: 'bigint', nullable: true })
  videoSizeBytes: string | null;

  @Column({ type: 'bigint', nullable: true })
  audioSizeBytes: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  storageContainer: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  blobNameVideo: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  blobNameAudio: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
