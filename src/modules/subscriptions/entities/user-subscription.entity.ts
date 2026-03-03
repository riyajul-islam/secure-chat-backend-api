import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { SubscriptionPlan } from './subscription-plan.entity';
import { SubscriptionStatus, UserLimitType } from '../enums/subscription.enum';

@Entity('user_subscriptions')
export class UserSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.subscriptions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: string;

  @ManyToOne(() => SubscriptionPlan, plan => plan.user_subscriptions)
  @JoinColumn({ name: 'plan_id' })
  plan: SubscriptionPlan;

  @Column()
  plan_id: string;

  @Column({ 
    type: 'enum', 
    enum: SubscriptionStatus,
    default: SubscriptionStatus.PENDING
  })
  status: SubscriptionStatus;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date' })
  end_date: Date;

  @Column({ default: true })
  auto_renew: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  paid_amount: number;

  @Column({ nullable: true })
  payment_method: string;

  @Column({ nullable: true })
  payment_transaction_id: string;

  // 📍 GPS Tracking সংক্রান্ত তথ্য
  @Column({ default: false })
  has_gps_tracking_access: boolean;

  @Column({ nullable: true })
  remaining_tracking_groups: number; // বাকি কতটি tracking group খুলতে পারবে

  // 👥 User Limit তথ্য (active subscription-এর জন্য)
  @Column({ 
    type: 'enum', 
    enum: UserLimitType,
    nullable: true
  })
  user_limit_type: UserLimitType;

  @Column({ nullable: true })
  custom_user_limit: number; // যদি custom limit দেওয়া থাকে

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
