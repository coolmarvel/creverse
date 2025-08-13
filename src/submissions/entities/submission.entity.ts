import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, OneToMany, OneToOne } from 'typeorm';

import { SubmissionLog, SubmissionMedia } from '.';
import { ResultStatus, SubmissionStatus } from '../constants';

import { Student } from '../../students/entities';
import { Revision } from '../../revisions/entities';

@Entity('submissions')
@Index('ux_submissions_student_component', ['studentId', 'componentType'], { unique: true })
export class Submission {
  @PrimaryGeneratedColumn('uuid')
  submissionId: string; // uuid_generate_v4()

  @Column({ type: 'bigint' })
  studentId: string;

  @ManyToOne(() => Student, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  componentType: string;

  @Column({ type: 'text' })
  submitText: string;

  @Index()
  @Column({
    type: 'enum',
    enum: SubmissionStatus,
    enumName: 'submission_status',
    default: SubmissionStatus.PENDING,
  })
  status: SubmissionStatus;

  @Column({
    type: 'enum',
    enum: ResultStatus,
    enumName: 'result_status',
    default: ResultStatus.OK,
  })
  result: ResultStatus;

  @Column({ type: 'varchar', length: 500, nullable: true })
  message: string | null;

  @Column({ type: 'smallint', nullable: true })
  score: number | null;

  @Column({ type: 'text', nullable: true })
  feedback: string | null;

  @Column({ type: 'jsonb', nullable: true })
  highlights: string[] | null;

  @Column({ type: 'text', nullable: true })
  highlightSubmitText: string | null;

  @Column({ type: 'integer', nullable: true })
  apiLatencyMs: number | null;

  @Index()
  @Column({ type: 'varchar', length: 128, nullable: true })
  traceId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  aiRaw: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToOne(() => SubmissionMedia, (m) => m.submission, { cascade: true })
  media: SubmissionMedia;

  @OneToMany(() => SubmissionLog, (l) => l.submission, { cascade: true })
  logs: SubmissionLog[];

  @OneToMany(() => Revision, (r) => r.submission, { cascade: true })
  revisions: Revision[];
}
