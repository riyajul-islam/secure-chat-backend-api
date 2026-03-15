import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne } from 'typeorm';
import { Exclude } from 'class-transformer';
import { FundRequest } from '../../payments/entities/fund-request.entity';
import { Transaction } from '../../payments/entities/transaction.entity';
import { VerificationRequest } from '../../verification/entities/verification-request.entity';
import { DeviceToken } from '../../notifications/entities/device-token.entity';
import { MessageQueue } from '../../chat/entities/message-queue.entity';
import { UserPresence } from '../../chat/entities/user-presence.entity';
import { Session } from '../../chat/entities/session.entity';
import { ConversationParticipant } from '../../chat/entities/conversation-participant.entity';
import { Message } from '../../chat/entities/message.entity';
import { UserSubscription } from '../../subscriptions/entities/user-subscription.entity';
import { SubscriptionRequest } from '../../subscriptions/entities/subscription-request.entity';
import { Report } from '../../reports/entities/report.entity';  // ← একটি মাত্র import

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 13, unique: true }) // 8 + 5 = 13 characters
  user_id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50, unique: true })
  username: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column()
  @Exclude()
  password_hash: string;

  @Column({ length: 20, default: 'offline' })
  status: string;

  @Column({ default: false })
  verified: boolean;

  @Column({ length: 20, default: 'non-verified' })
  verification_status: string;

  @Column({ length: 20, default: 'Inactive' })
  subscription_status: string;

  @Column({ type: 'timestamp', nullable: true })
  subscription_expires_at: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  credit_balance: number;

  @Column({ length: 100, nullable: true })
  country: string;

  @Column({ nullable: true })
  age: number;

  @Column({ type: 'text', nullable: true })
  profile_picture_url: string;

  @Column({ default: false })
  is_banned: boolean;

  @Column({ type: 'text', nullable: true })
  @Exclude()
  two_factor_secret: string;

  @Column({ nullable: true })
  last_login: Date;

  @CreateDateColumn()
  join_date: Date;

  @Column({ type: 'text', nullable: true })
  public_key: string;

  @Column({ type: 'text', nullable: true })
  signed_prekey: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relationships
  @OneToMany(() => FundRequest, fundRequest => fundRequest.user)
  fund_requests: FundRequest[];

  @OneToMany(() => Transaction, transaction => transaction.user)
  transactions: Transaction[];

  @OneToOne(() => VerificationRequest, verificationRequest => verificationRequest.user)
  verification_request: VerificationRequest;

  @OneToMany(() => DeviceToken, deviceToken => deviceToken.user)
  device_tokens: DeviceToken[];

  @OneToMany(() => MessageQueue, messageQueue => messageQueue.sender)
  sent_messages: MessageQueue[];

  @OneToMany(() => MessageQueue, messageQueue => messageQueue.recipient)
  received_messages: MessageQueue[];

  @OneToOne(() => UserPresence, userPresence => userPresence.user)
  presence: UserPresence;

  @OneToMany(() => Session, session => session.user)
  sessions: Session[];

  @OneToMany(() => ConversationParticipant, participant => participant.user)
  conversations: ConversationParticipant[];

  @OneToMany(() => Message, message => message.sender)
  chat_messages: Message[];

  @OneToMany(() => UserSubscription, userSubscription => userSubscription.user)
  subscriptions: UserSubscription[];

  @OneToMany(() => SubscriptionRequest, subscriptionRequest => subscriptionRequest.user)
  subscription_requests: SubscriptionRequest[];

  @OneToMany(() => Report, report => report.reporter)  // ← একটি মাত্র
  reports_made: Report[];

  @OneToMany(() => Report, report => report.reported)  // ← একটি মাত্র
  reports_received: Report[];
}