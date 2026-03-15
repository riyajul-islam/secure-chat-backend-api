import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('server_metrics')
@Index(['timestamp'])
export class ServerMetrics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  // CPU Metrics
  @Column({ type: 'float' })
  cpu_usage_percent: number;

  @Column({ type: 'float' })
  cpu_load_1min: number;

  @Column({ type: 'float' })
  cpu_load_5min: number;

  @Column({ type: 'float' })
  cpu_load_15min: number;

  @Column({ type: 'int' })
  cpu_cores: number;

  // Memory Metrics
  @Column({ type: 'bigint' }) // in bytes
  memory_total: number;

  @Column({ type: 'bigint' })
  memory_used: number;

  @Column({ type: 'bigint' })
  memory_free: number;

  @Column({ type: 'float' })
  memory_usage_percent: number;

  // Storage Metrics
  @Column({ type: 'bigint' }) // in bytes
  storage_total: number;

  @Column({ type: 'bigint' })
  storage_used: number;

  @Column({ type: 'bigint' })
  storage_free: number;

  @Column({ type: 'float' })
  storage_usage_percent: number;

  // Network Metrics
  @Column({ type: 'bigint' })
  network_in_bytes: number;

  @Column({ type: 'bigint' })
  network_out_bytes: number;

  @Column({ type: 'int' })
  active_connections: number;

  @Column({ type: 'int' })
  database_connections: number;

  // Application Metrics
  @Column({ type: 'int' })
  total_users: number;

  @Column({ type: 'int' })
  active_users_1min: number;

  @Column({ type: 'int' })
  active_users_5min: number;

  @Column({ type: 'int' })
  active_users_15min: number;

  @Column({ type: 'int' })
  active_calls: number; // audio + video calls

  @Column({ type: 'int' })
  active_audio_calls: number;

  @Column({ type: 'int' })
  active_video_calls: number;

  @Column({ type: 'int' })
  active_group_calls: number;

  @Column({ type: 'int' })
  messages_per_second: number;

  @Column({ type: 'float' })
  average_response_time_ms: number;

  @Column({ type: 'int' })
  api_requests_per_second: number;

  @Column({ type: 'int' })
  websocket_connections: number;

  // Error Metrics
  @Column({ type: 'int' })
  error_count_1min: number;

  @Column({ type: 'int' })
  error_count_5min: number;

  @Column({ type: 'int' })
  error_count_15min: number;

  @Column({ type: 'float' })
  error_rate_percent: number;

  @CreateDateColumn()
  created_at: Date;
}