import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  studentId: string;

  @Column({ type: 'bigint', unique: true, nullable: true })
  externalStudentId: string | null;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  studentName: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
