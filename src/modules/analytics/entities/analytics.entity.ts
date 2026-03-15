import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';
import * as crypto from 'crypto';

export enum EventType {
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  USER_REGISTER = 'user_register',
  MESSAGE_SENT = 'message_sent',
  MESSAGE_RECEIVED = 'message_received',
  AUDIO_CALL_START = 'audio_call_start',
  AUDIO_CALL_END = 'audio_call_end',
  VIDEO_CALL_START = 'video_call_start',
  VIDEO_CALL_END = 'video_call_end',
  GROUP_CALL_START = 'group_call_start',
  GROUP_CALL_END = 'group_call_end',
  FILE_UPLOAD = 'file_upload',
  FILE_DOWNLOAD = 'file_download',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',
  SUBSCRIPTION_PURCHASED = 'subscription_purchased',
  SUBSCRIPTION_EXPIRED = 'subscription_expired',
  USER_ACTIVE = 'user_active'
}

export enum PlatformType {
  ANDROID = 'android',
  IOS = 'ios',
  WEB = 'web',
  ADMIN = 'admin',
  UNKNOWN = 'unknown'
}

@Entity('analytics_events')
@Index(['timestamp', 'event_type'])
@Index(['hashed_user_id', 'timestamp'])
@Index(['country', 'timestamp'])
export class AnalyticsEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: EventType
  })
  event_type: EventType;

  // ✅ Hashed user_id - no raw ID stored
  @Column({ type: 'varchar', nullable: true })
  hashed_user_id: string | null;

  // ✅ Hash function for user_id (server-side)
  static hashUserId(userId: string): string {
    return crypto
      .createHash('sha256')
      .update(userId + process.env.HASH_SALT || 'secure-chat-salt')
      .digest('hex');
  }

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @Column({
    type: 'enum',
    enum: PlatformType,
    default: PlatformType.UNKNOWN
  })
  platform: PlatformType;

  @Column({ type: 'varchar', nullable: true })
  app_version: string | null;

  @Column({ type: 'varchar', nullable: true })
  device_model: string | null;

  @Column({ type: 'varchar', nullable: true })
  os_version: string | null;

  // ✅ Only country/city (from IP, no raw IP stored)
  @Column({ type: 'varchar', nullable: true })
  country: string | null;

  @Column({ type: 'varchar', nullable: true })
  city: string | null;

  // ✅ Performance metrics only
  @Column({ type: 'int', default: 0 })
  response_time_ms: number;

  @CreateDateColumn()
  created_at: Date;
}