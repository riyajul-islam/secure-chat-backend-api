import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Conversation } from './conversation.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Conversation, conversation => conversation.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @Column()
  conversation_id: string;

  @ManyToOne(() => User, user => user.chat_messages, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column({ nullable: true })
  sender_id: string;

  @Column({ type: 'text' })
  encrypted_content: string;

  @Column({ length: 20, default: 'text' })
  message_type: string;

  @Column({ length: 20, default: 'sent' })
  status: string;

  @CreateDateColumn()
  created_at: Date;
}
