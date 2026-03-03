import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Admin } from '../../admins/entities/admin.entity';
import { FundRequestStatus } from '../enums/payment.enum';

@Entity('fund_requests')
export class FundRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.fund_requests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 100 })
  payment_method: string;

  @Column({ length: 255, nullable: true })
  transaction_id: string;

  @Column({ type: 'jsonb', nullable: true })
  proof_images: string[];

  @Column({ 
    type: 'enum', 
    enum: FundRequestStatus,
    default: FundRequestStatus.PENDING
  })
  status: FundRequestStatus;

  @ManyToOne(() => Admin, admin => admin.approved_fund_requests, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approved_by: Admin;

  @Column({ nullable: true })
  approved_by_id: string;

  @Column({ type: 'text', nullable: true })
  rejection_reason: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
