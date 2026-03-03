import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Admin } from '../../admins/entities/admin.entity';

export enum NotificationType {
    ACCOUNT_CREATED = 'account_created',
    ACCOUNT_VERIFIED = 'account_verified',
    ACCOUNT_BANNED = 'account_banned',
    ACCOUNT_UNBANNED = 'account_unbanned',
    PASSWORD_CHANGED = 'password_changed',
    PROFILE_UPDATED = 'profile_updated',

    SUBSCRIPTION_CREATED = 'subscription_created',
    SUBSCRIPTION_ACTIVATED = 'subscription_activated',
    SUBSCRIPTION_EXPIRING = 'subscription_expiring',
    SUBSCRIPTION_EXPIRED = 'subscription_expired',
    SUBSCRIPTION_CANCELLED = 'subscription_cancelled',
    TRIAL_STARTED = 'trial_started',
    TRIAL_ENDING = 'trial_ending',
    TRIAL_ENDED = 'trial_ended',

    PAYMENT_SUCCESS = 'payment_success',
    PAYMENT_FAILED = 'payment_failed',
    PAYMENT_PENDING = 'payment_pending',
    PAYMENT_REFUNDED = 'payment_refunded',
    INVOICE_GENERATED = 'invoice_generated',

    REPORT_SUBMITTED = 'report_submitted',
    REPORT_RESOLVED = 'report_resolved',
    REPORT_REJECTED = 'report_rejected',
    REPORT_ESCALATED = 'report_escalated',

    ADMIN_MESSAGE = 'admin_message',
    SYSTEM_UPDATE = 'system_update',
    MAINTENANCE_ALERT = 'maintenance_alert',

    CUSTOM = 'custom'
}

export enum NotificationPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    URGENT = 'urgent'
}

export enum NotificationStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SCHEDULED = 'scheduled',
    ARCHIVED = 'archived'
}

export enum TargetAudience {
    ALL_USERS = 'all_users',
    NEW_USERS = 'new_users',
    VERIFIED_USERS = 'verified_users',
    UNVERIFIED_USERS = 'unverified_users',
    ACTIVE_SUBSCRIBERS = 'active_subscribers',
    INACTIVE_SUBSCRIBERS = 'inactive_subscribers',
    EXPIRED_SUBSCRIBERS = 'expired_subscribers',
    TRIAL_USERS = 'trial_users',
    SPECIFIC_USER = 'specific_user',
    ADMINS = 'admins'
}

export enum DeliveryMethod {
    IN_APP = 'in_app',
    EMAIL = 'email',
    PUSH = 'push',
    SMS = 'sms'
}

export enum FrequencyType {
    ONCE = 'once',
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    CUSTOM = 'custom'
}

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 255 })
    title: string;

    @Column({ type: 'text' })
    content: string;

    @Column({
        type: 'enum',
        enum: NotificationType
    })
    type: NotificationType;

    @Column({ default: false })
    is_system: boolean;

    @Column({
        type: 'enum',
        enum: NotificationPriority,
        default: NotificationPriority.MEDIUM
    })
    priority: NotificationPriority;

    @Column({
        type: 'enum',
        enum: NotificationStatus,
        default: NotificationStatus.ACTIVE
    })
    status: NotificationStatus;

    @Column({
        type: 'enum',
        enum: TargetAudience,
        default: TargetAudience.ALL_USERS
    })
    target_audience: TargetAudience;

    @Column({ type: 'jsonb', nullable: true })
    target_details: {
        specific_user_id?: string;
        user_ids?: string[];
        roles?: string[];
        subscription_types?: string[];
    } | null;

    @Column({
        type: 'enum',
        enum: DeliveryMethod,
        array: true,
        default: [DeliveryMethod.IN_APP]
    })
    delivery_methods: DeliveryMethod[];

    @Column({
        type: 'enum',
        enum: FrequencyType,
        default: FrequencyType.ONCE
    })
    frequency: FrequencyType;

    @Column({ type: 'jsonb', nullable: true })
    frequency_details: {
        interval_days?: number;
        interval_hours?: number;
        specific_days?: string[];
        specific_time?: string;
        start_date?: Date;
        end_date?: Date;
    } | null;

    @Column({ type: 'text', nullable: true })
    image_url: string | null;

    @Column({ type: 'text', nullable: true })
    action_url: string | null;

    @Column({ type: 'varchar', length: 100, nullable: true })  // ← Changed from text to varchar with proper type
    action_text: string | null;

    @Column({ default: false })
    show_popup: boolean;

    @Column({ default: false })
    play_sound: boolean;

    @Column({ default: false })
    vibrate: boolean;

    @Column({ default: 0 })
    view_count: number;

    @Column({ default: 0 })
    click_count: number;

    @Column({ type: 'timestamp', nullable: true })
    scheduled_at: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    expires_at: Date | null;

    @Column({ type: 'jsonb', nullable: true })
    template_variables: Record<string, any> | null;

    // Who created/updated
    @ManyToOne(() => Admin)
    @JoinColumn({ name: 'created_by' })
    created_by: Admin | null;

    @Column({ type: 'varchar', nullable: true })
    created_by_id: string | null;

    @ManyToOne(() => Admin)
    @JoinColumn({ name: 'updated_by' })
    updated_by: Admin | null;

    @Column({ type: 'varchar', nullable: true })
    updated_by_id: string | null;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}