import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

export enum SecurityEventType {
  BRUTE_FORCE_ATTEMPT = 'brute_force_attempt',
  MULTIPLE_FAILED_LOGINS = 'multiple_failed_logins',
  SUSPICIOUS_LOGIN = 'suspicious_login',
  LOGIN_FROM_NEW_DEVICE = 'login_from_new_device',
  LOGIN_FROM_UNUSUAL_LOCATION = 'login_from_unusual_location',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  SUSPICIOUS_API_PATTERN = 'suspicious_api_pattern',
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
  XSS_ATTEMPT = 'xss_attempt',
  CSRF_ATTEMPT = 'csrf_attempt',
  BOT_DETECTED = 'bot_detected',
  DDOS_ATTEMPT = 'ddos_attempt',
  DATA_LEAK_ATTEMPT = 'data_leak_attempt',
  UNAUTHORIZED_ACCESS_ATTEMPT = 'unauthorized_access_attempt',
  TOKEN_MISUSE = 'token_misuse',
  BLOCKED_COUNTRY_ACCESS = 'blocked_country_access',
  VPN_DETECTED = 'vpn_detected',
  PROXY_DETECTED = 'proxy_detected',
  SERVER_OVERLOAD = 'server_overload',
  DATABASE_ATTACK = 'database_attack'
}

export enum SecurityLevel {
  INFO = 'info',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum BlockStatus {
  NOT_BLOCKED = 'not_blocked',
  TEMPORARILY_BLOCKED = 'temporarily_blocked',
  PERMANENTLY_BLOCKED = 'permanently_blocked',
  AUTO_BLOCKED = 'auto_blocked'
}

@Entity('security_events')
@Index(['timestamp', 'event_type'])
@Index(['ip_address', 'timestamp'])
@Index(['user_id', 'timestamp'])
export class SecurityEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: SecurityEventType
  })
  event_type: SecurityEventType;

  @Column({
    type: 'enum',
    enum: SecurityLevel,
    default: SecurityLevel.MEDIUM
  })
  security_level: SecurityLevel;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @Column({ type: 'varchar', nullable: true }) // ✅ Fix: Use varchar instead of Object
  user_id: string | null;

  @Column({ type: 'varchar', nullable: true })
  username: string | null;

  @Column({ type: 'inet' })
  ip_address: string;

  @Column({ type: 'varchar', nullable: true })
  country: string | null;

  @Column({ type: 'varchar', nullable: true })
  city: string | null;

  @Column({ type: 'float', nullable: true })
  latitude: number | null;

  @Column({ type: 'float', nullable: true })
  longitude: number | null;

  @Column({ type: 'text', nullable: true })
  user_agent: string | null;

  @Column({ type: 'varchar', nullable: true })
  platform: string | null;

  @Column({ type: 'varchar', nullable: true })
  browser: string | null;

  @Column({ type: 'varchar', nullable: true })
  device_type: string | null;

  @Column({ type: 'text', nullable: true })
  endpoint: string | null;

  @Column({ type: 'varchar', nullable: true })
  method: string | null;

  @Column({ type: 'jsonb', nullable: true })
  headers: any;

  @Column({ type: 'jsonb', nullable: true })
  request_data: any;

  @Column({ type: 'text', nullable: true })
  error_message: string | null;

  @Column({ type: 'jsonb', nullable: true })
  stack_trace: any;

  @Column({
    type: 'enum',
    enum: BlockStatus,
    default: BlockStatus.NOT_BLOCKED
  })
  block_status: BlockStatus;

  @Column({ type: 'timestamp', nullable: true })
  blocked_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  blocked_until: Date | null;

  @Column({ type: 'varchar', nullable: true })
  blocked_by: string | null;

  @Column({ type: 'text', nullable: true })
  block_reason: string | null;

  @Column({ default: 0 })
  attempt_count: number;

  @Column({ type: 'jsonb', nullable: true })
  related_events: string[];

  @Column({ default: false })
  is_resolved: boolean;

  @Column({ type: 'timestamp', nullable: true })
  resolved_at: Date | null;

  @Column({ type: 'text', nullable: true })
  resolution_notes: string | null;

  @CreateDateColumn()
  created_at: Date;
}