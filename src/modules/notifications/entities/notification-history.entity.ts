import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Admin } from '../../admins/entities/admin.entity';

@Entity('notification_history')
export class NotificationHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'jsonb', nullable: true })
  data: any;

  @Column({ type: 'jsonb', nullable: true })
  recipients: any;

  @ManyToOne(() => Admin, admin => admin.sent_notifications, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'sent_by' })
  sent_by: Admin;

  @Column({ nullable: true })
  sent_by_id: string;

  @CreateDateColumn()
  sent_at: Date;
}
