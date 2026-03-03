import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Admin } from './admin.entity';

@Entity('admin_login_history')
export class AdminLoginHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Admin, admin => admin.login_history, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'admin_id' })
  admin: Admin;

  @Column()
  admin_id: string;

  @CreateDateColumn()
  login_at: Date;

  @Column({ nullable: true })
  logout_at: Date;

  @Column({ nullable: true })
  ip_address: string;

  @Column({ nullable: true })
  user_agent: string;

  @Column({ default: 'success' })
  status: string;

  @Column({ nullable: true })
  failure_reason: string;
}
