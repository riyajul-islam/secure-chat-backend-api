import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { FundRequest } from '../../payments/entities/fund-request.entity';
import { Report } from '../../reports/entities/report.entity';
import { Announcement } from '../../announcements/entities/announcement.entity';
import { AuditLog } from '../../audit/entities/audit-log.entity';
import { NotificationHistory } from '../../notifications/entities/notification-history.entity';
import { AdminLoginHistory } from './admin-login-history.entity';

@Entity('admins')
export class Admin {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100 })
    full_name: string;

    @Column({ length: 100, unique: true })
    email: string;

    @Column()
    @Exclude()
    password_hash: string;

    @Column({ length: 50, default: 'Regular Administrator' })
    admin_type: string;

    @Column({ length: 20, default: 'Active' })
    status: string;

    @Column({ type: 'jsonb', default: [] })
    permissions: string[];

    @Column({ nullable: true })
    last_login: Date;

    @Column({ default: false })
    two_factor_enabled: boolean;

    @Column({ type: 'text', nullable: true })
    @Exclude()
    two_factor_secret: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // Relationships
    @OneToMany(() => FundRequest, fundRequest => fundRequest.approved_by)
    approved_fund_requests: FundRequest[];

    @OneToMany(() => Report, report => report.processed_by)
    resolved_reports: Report[];

    @OneToMany(() => Announcement, announcement => announcement.created_by)
    announcements: Announcement[];

    @OneToMany(() => AuditLog, auditLog => auditLog.admin)
    audit_logs: AuditLog[];

    @OneToMany(() => NotificationHistory, notification => notification.sent_by)
    sent_notifications: NotificationHistory[];


    @OneToMany(() => AdminLoginHistory, loginHistory => loginHistory.admin)
    login_history: AdminLoginHistory[];
    

      // নতুন fields - এভাবে আপডেট করুন
    @Column({ nullable: true, type: 'timestamp' })
    last_logout: Date;

    @Column({ default: false })
    is_locked: boolean;

    @Column({ nullable: true, type: 'text' })
    lock_reason: string;

    @Column({ nullable: true, type: 'uuid' })
    locked_by: string;

    @Column({ nullable: true, type: 'timestamp' })
    lock_expires_at: Date;

    @Column({ nullable: true, type: 'text' })
    avatar_url: string;

    @Column({ length: 20, nullable: true })
    phone: string;

    @Column({ length: 100, nullable: true })
    department: string;

    @Column({ nullable: true, type: 'inet' })
    last_ip: string;

    @Column({ nullable: true, type: 'text' })
    last_user_agent: string;

}
