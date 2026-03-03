import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Admin } from '../../admins/entities/admin.entity';

export enum VerificationPlanStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
  SCHEDULED = 'scheduled',
  EXPIRED = 'expired'
}

export enum TimeUnit {
  MONTHS = 'months',
  YEARS = 'years',
  CUSTOM = 'custom'
}

export enum DocumentType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  NUMBER = 'number',
  EMAIL = 'email',
  DATE = 'date',
  FILE = 'file',
  IMAGE = 'image'
}

export interface RequiredDocument {
  id: string;
  label: string;
  type: DocumentType;
  required: boolean;
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    acceptedFiles?: string[]; // for file/image types
    maxSize?: number; // in MB
  };
}

@Entity('verification_plans')
export class VerificationPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 500 })
  credits: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 6.00 })
  usd_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 500 })
  bdt_price: number;

  @Column({ 
    type: 'enum', 
    enum: TimeUnit,
    default: TimeUnit.MONTHS
  })
  time_unit: TimeUnit;

  @Column({ type: 'int', default: 6 })
  time_value: number;

  @Column({ type: 'int', nullable: true })
  custom_time_value: number | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  custom_time_unit: string | null;

  // Schedule system
  @Column({ default: false })
  is_offer: boolean;

  @Column({ type: 'timestamp', nullable: true })
  offer_start_date: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  offer_end_date: Date | null;

  @Column({ type: 'int', nullable: true })
  offer_discount_percentage: number | null; // Optional discount

  @Column({ type: 'varchar', length: 255, nullable: true })
  offer_badge_text: string | null; // e.g., "Limited Time", "50% OFF"

  // Email verification setting
  @Column({ default: false })
  require_email_verification: boolean;

  // Documents required
  @Column({ type: 'jsonb', nullable: true })
  required_documents: RequiredDocument[];

  @Column({ 
    type: 'enum', 
    enum: VerificationPlanStatus,
    default: VerificationPlanStatus.ACTIVE
  })
  status: VerificationPlanStatus;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ type: 'int', default: 0 })
  total_requests: number;

  @Column({ type: 'int', default: 0 })
  approved_requests: number;

  @Column({ type: 'jsonb', nullable: true })
  features: string[];

  @Column({ default: false })
  is_popular: boolean;

  @Column({ default: false })
  is_recommended: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

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