import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { SubscriptionPlan } from './subscription-plan.entity';
import { Admin } from '../../admins/entities/admin.entity';
import { SubscriptionRequestStatus } from '../enums/subscription.enum';

class ProofField {
    id: string;
    label: string;
    type: string;
    value?: string;
}

@Entity('subscription_requests')
export class SubscriptionRequest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, user => user.subscription_requests)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column()
    user_id: string;

    @ManyToOne(() => SubscriptionPlan, plan => plan.subscription_requests)
    @JoinColumn({ name: 'plan_id' })
    plan: SubscriptionPlan;

    @Column()
    plan_id: string;

    @Column({
        type: 'enum',
        enum: SubscriptionRequestStatus,
        default: SubscriptionRequestStatus.PENDING
    })
    status: SubscriptionRequestStatus;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({ length: 100, nullable: true })
    payment_method: string;

    @Column({ length: 50, nullable: true })
    payment_method_type: string;

    @Column({ length: 100, nullable: true })
    payment_method_name: string;

    @Column({ length: 50, nullable: true })
    approval_type: string;

    @Column({ length: 10, nullable: true })
    payment_currency: string;

    @Column({ length: 255, nullable: true })
    transaction_id: string;

    @Column({ type: 'jsonb', nullable: true })
    proof_fields: ProofField[];

    @Column({ type: 'jsonb', nullable: true })
    proof_images: string[];

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ type: 'text', nullable: true })
    admin_notes: string;

    @ManyToOne(() => Admin, { nullable: true })
    @JoinColumn({ name: 'processed_by' })
    processed_by: Admin;

    @Column({ nullable: true })
    processed_by_id: string;

    @Column({ nullable: true })
    processed_at: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}