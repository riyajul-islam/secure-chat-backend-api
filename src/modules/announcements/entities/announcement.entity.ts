import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Admin } from '../../admins/entities/admin.entity';

export enum TargetAudience {
  ALL_USERS = 'all_users',
  SPECIFIC_USER = 'specific_user',
  VERIFIED_USERS = 'verified_users',
  UNVERIFIED_USERS = 'unverified_users',
  ACTIVE_SUBSCRIBERS = 'active_subscribers',
  INACTIVE_SUBSCRIBERS = 'inactive_subscribers',
  EXPIRED_SUBSCRIBERS = 'expired_subscribers'
}

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  YOUTUBE = 'youtube',
  VIMEO = 'vimeo'
}

@Entity('announcements')
export class Announcement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: MediaType,
    default: MediaType.IMAGE
  })
  media_type: MediaType;

  @Column({ type: 'text', nullable: true })
  media_url: string;

  @Column({ type: 'text', nullable: true })
  youtube_url: string;

  @Column({ type: 'text', nullable: true })
  vimeo_url: string;

  @Column({ type: 'text', nullable: true })
  learn_more_text: string;

  @Column({ type: 'text', nullable: true })
  learn_more_url: string;

  @Column({
    type: 'enum',
    enum: TargetAudience,
    default: TargetAudience.ALL_USERS
  })
  target_audience: TargetAudience;

  @Column({ nullable: true })
  specific_user_id: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'timestamp', nullable: true })
  scheduled_at: Date | null;  // ← Changed to Date | null

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date | null;    // ← Changed to Date | null

  @Column({ default: 0 })
  view_count: number;

  @Column({ default: 0 })
  click_count: number;

  @Column({ type: 'text', nullable: true })
  preview_image_url: string;

  // Who created/updated
  @ManyToOne(() => Admin)
  @JoinColumn({ name: 'created_by' })
  created_by: Admin;

  @Column({ nullable: true })
  created_by_id: string;

  @ManyToOne(() => Admin)
  @JoinColumn({ name: 'updated_by' })
  updated_by: Admin;

  @Column({ nullable: true })
  updated_by_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}