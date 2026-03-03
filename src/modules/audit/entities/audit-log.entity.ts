import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Admin } from '../../admins/entities/admin.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Admin, admin => admin.audit_logs, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'admin_id' })
  admin: Admin;

  @Column({ nullable: true })
  admin_id: string;

  @Column({ length: 255 })
  action: string;

  @Column({ length: 100, nullable: true })
  entity_type: string;

  @Column({ nullable: true })
  entity_id: string;

  @Column({ type: 'jsonb', nullable: true })
  details: any;

  @Column({ type: 'inet', nullable: true })
  ip_address: string;

  @CreateDateColumn()
  created_at: Date;
}
