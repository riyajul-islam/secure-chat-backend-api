import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum PaymentMethodType {
  BANK = 'bank',
  MOBILE = 'mobile',
  PAYPAL_MANUAL = 'paypal_manual',
  CRYPTO = 'crypto',
  CUSTOM = 'custom',
  PAYPAL_AUTO = 'paypal_auto',
  SSL_COMMERZ = 'ssl_commerz',
  EASYPAY = 'easypay',
  ZINIPAY = 'zinipay',
  PAYSTATION = 'paystation'
}

export enum PaymentCurrency {
  BOTH = 'both',
  USD = 'usd',
  BDT = 'bdt'
}

export enum PaymentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export enum ApprovalType {
  PENDING = 'pending',
  AUTO_APPROVED = 'auto_approved',
  APPROVED = 'approved'
}

// Dynamic Field Type for form building
export interface DynamicField {
  id: string;
  type: 'text' | 'textarea' | 'number' | 'email' | 'date' | 'file' | 'select';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // for select type
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

@Entity('payment_methods')
export class PaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ 
    type: 'enum', 
    enum: PaymentMethodType,
    default: PaymentMethodType.BANK
  })
  type: PaymentMethodType;

  @Column({ 
    type: 'enum', 
    enum: PaymentCurrency,
    default: PaymentCurrency.BOTH
  })
  currency: PaymentCurrency;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ 
    type: 'enum', 
    enum: PaymentStatus,
    default: PaymentStatus.ACTIVE
  })
  status: PaymentStatus;

  @Column({ 
    type: 'enum', 
    enum: ApprovalType,
    default: ApprovalType.PENDING
  })
  approval_type: ApprovalType;

  @Column({ default: 0 })
  sort_order: number;

  @Column({ length: 20, default: 'blue' })
  color: string;

  // Fee Structure
  @Column({ type: 'jsonb', nullable: true })
  fee_structure: {
    min_amount?: number;
    max_amount?: number;
    fixed_fee?: number;
    percentage_fee?: number;
  };

  // Dynamic Fields for Payment Proof Collection
  @Column({ type: 'jsonb', nullable: true })
  proof_fields: DynamicField[];

  // Static details (existing)
  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  instructions: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}