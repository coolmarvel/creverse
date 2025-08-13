import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('stats_weekly')
export class StatsWeekly {
  @PrimaryColumn({ type: 'smallint' })
  statYear: number;

  @PrimaryColumn({ type: 'smallint' })
  statWeek: number;

  @Column({ type: 'integer', default: 0 })
  totalCount: number;

  @Column({ type: 'integer', default: 0 })
  successCount: number;

  @Column({ type: 'integer', default: 0 })
  failedCount: number;

  @Column({ type: 'integer', default: 0 })
  pendingCount: number;

  @Column({ type: 'integer', default: 0 })
  processingCount: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
