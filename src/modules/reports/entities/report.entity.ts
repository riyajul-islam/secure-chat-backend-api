import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Admin } from '../../admins/entities/admin.entity';
import { ReportType, ReportStatus, ReportAction } from '../enums/report.enum';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.reports_made)
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  @Column()
  reporter_id: string;

  @ManyToOne(() => User, user => user.reports_received)
  @JoinColumn({ name: 'reported_id' })
  reported: User;

  @Column()
  reported_id: string;

  @Column({ 
    type: 'enum', 
    enum: ReportType,
  })
  type: ReportType;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  evidence: string[]; // Screenshots or other evidence URLs

  @Column({ 
    type: 'enum', 
    enum: ReportStatus,
    default: ReportStatus.PENDING
  })
  status: ReportStatus;

  @Column({ 
    type: 'enum', 
    enum: ReportAction,
    nullable: true
  })
  action_taken: ReportAction;

  @ManyToOne(() => Admin, { nullable: true })
  @JoinColumn({ name: 'processed_by' })
  processed_by: Admin;

  @Column({ nullable: true })
  processed_by_id: string;

  @Column({ type: 'timestamp', nullable: true })
  processed_at: Date;

  @Column({ type: 'text', nullable: true })
  admin_notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
