import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Admin } from '../../admins/entities/admin.entity';

export enum PopupType {
  WELCOME = 'welcome',
  TRIAL_INFO = 'trial_info',
  SUBSCRIPTION_EXPIRY = 'subscription_expiry',
  SUBSCRIPTION_SUCCESS = 'subscription_success',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',
  MAINTENANCE = 'maintenance',
  UPDATE_AVAILABLE = 'update_available',
  FEATURE_ANNOUNCEMENT = 'feature_announcement',
  PROMOTIONAL = 'promotional',
  CUSTOM = 'custom'
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
  SPECIFIC_USER = 'specific_user'
}

export enum DisplayFrequency {
  ONCE = 'once',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  ALWAYS = 'always'
}

export enum PopupStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  SCHEDULED = 'scheduled',
  EXPIRED = 'expired',
  PAUSED = 'paused'
}

@Entity('popups')
export class Popup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ 
    type: 'enum', 
    enum: PopupType,
    default: PopupType.CUSTOM
  })
  type: PopupType;

  @Column({ default: false })
  is_system: boolean;

  @Column({ 
    type: 'enum', 
    enum: TargetAudience,
    default: TargetAudience.ALL_USERS
  })
  target_audience: TargetAudience;

  @Column({ type: 'varchar', nullable: true })
  specific_user_id: string | null;  // This works for both UUID and custom IDs

  @Column({ 
    type: 'enum', 
    enum: DisplayFrequency,
    default: DisplayFrequency.ONCE
  })
  display_frequency: DisplayFrequency;

  @Column({ type: 'text', nullable: true })
  image_url: string | null;

  @Column({ type: 'text', nullable: true })
  video_url: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  action_button_text: string | null;

  @Column({ type: 'text', nullable: true })
  action_button_link: string | null;

  @Column({ default: true })
  show_close_button: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  close_button_text: string | null;

  @Column({ default: 5 })
  auto_close_seconds: number;

  @Column({ default: false })
  show_notification: boolean;

  @Column({ type: 'text', nullable: true })
  notification_text: string | null;

  @Column({ default: 3 })
  notification_delay_seconds: number;

  @Column({ 
    type: 'enum', 
    enum: PopupStatus,
    default: PopupStatus.DRAFT
  })
  status: PopupStatus;

  @Column({ type: 'timestamp', nullable: true })
  start_date: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  end_date: Date | null;

  @Column({ default: 0 })
  priority: number;

  @Column({ default: 0 })
  view_count: number;

  @Column({ default: 0 })
  click_count: number;

  @Column({ default: 0 })
  close_count: number;

  @Column({ type: 'jsonb', nullable: true })
  settings: {
    width?: string;
    height?: string;
    position?: 'center' | 'top' | 'bottom';
    overlay?: boolean;
    animation?: 'fade' | 'slide' | 'zoom';
  } | null;

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