import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('message_queue')
@Index(['recipient_id', 'delivered', 'created_at'])
export class MessageQueue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.sent_messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column()
  sender_id: string;

  @ManyToOne(() => User, user => user.received_messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipient_id' })
  recipient: User;

  @Column()
  recipient_id: string;

  @Column({ type: 'text' })
  encrypted_content: string;

  @Column({ length: 20, default: 'text' })
  message_type: string;

  @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP + INTERVAL '90 days'" })
  expires_at: Date;

  @Column({ default: false })
  delivered: boolean;

  @Column({ nullable: true })
  delivered_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
