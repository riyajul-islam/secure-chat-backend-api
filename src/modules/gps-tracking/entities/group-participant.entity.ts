import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TrackingGroup } from './tracking-group.entity';
import { ParticipantStatus, ParticipantRole } from '../enums/tracking.enum';

@Entity('group_participants')
export class GroupParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => TrackingGroup, group => group.participants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: TrackingGroup;

  @Column()
  group_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: string;

  @Column({ 
    type: 'enum', 
    enum: ParticipantRole,
    default: ParticipantRole.MEMBER
  })
  role: ParticipantRole;

  @Column({ 
    type: 'enum', 
    enum: ParticipantStatus,
    default: ParticipantStatus.PENDING
  })
  status: ParticipantStatus;

  @Column({ type: 'timestamp', nullable: true })
  joined_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  left_at: Date;

  @Column({ type: 'jsonb', nullable: true })
    last_location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude?: number;      // ← এই line টি যোগ করুন
    speed?: number;
    heading?: number;
    timestamp: Date;
    };

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
