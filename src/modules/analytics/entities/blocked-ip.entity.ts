import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum BlockReason {
  BRUTE_FORCE = 'brute_force',
  DDOS_ATTEMPT = 'ddos_attempt',
  SQL_INJECTION = 'sql_injection',
  XSS_ATTEMPT = 'xss_attempt',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  VPN_DETECTED = 'vpn_detected',
  PROXY_DETECTED = 'proxy_detected',
  MANUAL_BLOCK = 'manual_block'
}

export enum BlockAction {
  AUTO_BLOCK = 'auto_block',
  MANUAL_BLOCK = 'manual_block',
  TEMPORARY_BLOCK = 'temporary_block',
  PERMANENT_BLOCK = 'permanent_block'
}

@Entity('blocked_ips')
@Index(['ip_address', 'is_active'])
@Index(['expires_at'])
export class BlockedIP {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'inet', unique: true })
  ip_address: string;

  @Column({ 
    type: 'enum', 
    enum: BlockReason 
  })
  reason: BlockReason;

  @Column({ 
    type: 'enum', 
    enum: BlockAction,
    default: BlockAction.AUTO_BLOCK
  })
  action: BlockAction;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'timestamp', nullable: true }) // ✅ Change this line
  expires_at: Date | null; // Allow null

  @Column({ type: 'int', default: 0 })
  attempt_count: number;

  @Column({ type: 'jsonb', nullable: true })
  related_ips: string[];

  @Column({ type: 'jsonb', nullable: true })
  affected_users: string[];

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  isp: string;

  @Column({ type: 'float', nullable: true })
  latitude: number;

  @Column({ type: 'float', nullable: true })
  longitude: number;

  @Column({ nullable: true })
  blocked_by: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  unblocked_at: Date;

  @Column({ nullable: true })
  unblocked_by: string;

  @Column({ type: 'text', nullable: true })
  unblock_reason: string;
}