import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { VerificationPlan } from './verification-plan.entity';
import { Admin } from '../../admins/entities/admin.entity';

export enum VerificationRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ESCALATED = 'escalated',
  AWAITING_EMAIL_VERIFICATION = 'awaiting_email_verification'
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export interface DocumentResponse {
  document_id: string;
  label: string;
  type: string;
  value?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  verified?: boolean;
}

@Entity('verification_requests')
export class VerificationRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column()
  user_id: string;

  @ManyToOne(() => VerificationPlan)
  @JoinColumn({ name: 'plan_id' })
  plan: VerificationPlan | null;

  @Column()
  plan_id: string;

  // Email verification
  @Column({ type: 'varchar', length: 255, nullable: true })
  verification_email: string | null;

  @Column({ default: false })
  email_verified: boolean;

  @Column({ type: 'varchar', length: 6, nullable: true })
  email_verification_code: string | null;

  @Column({ type: 'timestamp', nullable: true })
  email_verification_sent_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  email_verified_at: Date | null;

  // Document responses
  @Column({ type: 'jsonb', nullable: true })
  document_responses: DocumentResponse[];

  // Payment info
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 10 })
  currency: string;

  @Column({ length: 100 })
  payment_method: string;

  @Column({ length: 100, nullable: true })
  payment_method_type: string;

  @Column({ length: 100, nullable: true })
  payment_method_name: string;

  @Column({ length: 255, nullable: true })
  transaction_id: string;

  @Column({ type: 'jsonb', nullable: true })
  proof_fields: Array<{
    id: string;
    label: string;
    type: string;
    value?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  proof_images: string[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ 
    type: 'enum', 
    enum: VerificationRequestStatus,
    default: VerificationRequestStatus.PENDING
  })
  status: VerificationRequestStatus;

  @Column({ 
    type: 'enum', 
    enum: RiskLevel,
    default: RiskLevel.LOW
  })
  risk_level: RiskLevel;

  @Column({ type: 'text', nullable: true })
  admin_notes: string;

  @Column({ nullable: true })
  processed_at: Date;

  @ManyToOne(() => Admin)
  @JoinColumn({ name: 'processed_by' })
  processed_by: Admin | null;

  @Column({ type: 'varchar', nullable: true })
  processed_by_id: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}