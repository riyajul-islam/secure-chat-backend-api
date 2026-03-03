import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { BillingCycle, PlanType, UserLimitType, TrackingPermission } from '../enums/subscription.enum';
import { UserSubscription } from './user-subscription.entity';
import { SubscriptionRequest } from './subscription-request.entity';

@Entity('subscription_plans')
export class SubscriptionPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ 
    type: 'enum', 
    enum: PlanType,
    default: PlanType.CUSTOM
  })
  type: PlanType;

  // Credit System
  @Column({ default: 500 })
  credits: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 6.00 })
  usd_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 500 })
  bdt_price: number;

  @Column({ 
    type: 'enum', 
    enum: BillingCycle,
    default: BillingCycle.MONTHLY
  })
  billing_cycle: BillingCycle;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  features: string[];

  // User Limit
  @Column({ 
    type: 'enum', 
    enum: UserLimitType,
    default: UserLimitType.ONE
  })
  user_limit_type: UserLimitType;

  @Column({ nullable: true })
  custom_user_limit: number;

  // Group Features
  @Column({ default: true })
  can_group_call: boolean;

  @Column({ default: 5 })
  max_groups: number;

  @Column({ default: 10 })
  max_group_members: number;

  // GPS Tracking Features
  @Column({ default: false })
  has_gps_tracking: boolean;

  @Column({ 
    type: 'enum', 
    enum: TrackingPermission,
    default: TrackingPermission.CANNOT_TRACK
  })
  gps_tracking_permission: TrackingPermission;

  @Column({ nullable: true })
  max_tracking_groups: number;

  @Column({ nullable: true })
  max_tracked_users_per_group: number;

  // Hidden Features (Always True)
  @Column({ default: true })
  high_security: boolean;

  @Column({ default: true })
  unlimited_message: boolean;

  @Column({ default: true })
  unlimited_attachments: boolean;

  @Column({ default: true })
  unlimited_storage: boolean;

  @Column({ default: true })
  unlimited_calls: boolean;

  // Plan status
  @Column({ default: true })
  is_active: boolean;

  @Column({ default: 0 })
  sort_order: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relationships
  @OneToMany(() => UserSubscription, userSubscription => userSubscription.plan)
  user_subscriptions: UserSubscription[];

  @OneToMany(() => SubscriptionRequest, subscriptionRequest => subscriptionRequest.plan)
  subscription_requests: SubscriptionRequest[];
}