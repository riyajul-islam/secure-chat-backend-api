import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TransactionType, TransactionStatus } from '../enums/payment.enum';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: string;

  @Column({ 
    type: 'enum', 
    enum: TransactionType
  })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 100, nullable: true })
  payment_method: string;

  @Column({ 
    type: 'enum', 
    enum: TransactionStatus,
    default: TransactionStatus.COMPLETED
  })
  status: TransactionStatus;

  @Column({ length: 255, nullable: true })
  reference: string;

  @CreateDateColumn()
  created_at: Date;
}
