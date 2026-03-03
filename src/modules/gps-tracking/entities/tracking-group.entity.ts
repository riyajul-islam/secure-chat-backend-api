import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { SubscriptionPlan } from '../../subscriptions/entities/subscription-plan.entity';
import { GroupStatus } from '../enums/tracking.enum';
import { GroupParticipant } from './group-participant.entity';

@Entity('tracking_groups')
export class TrackingGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'host_id' })
  host: User;

  @Column()
  host_id: string;

  @ManyToOne(() => SubscriptionPlan)
  @JoinColumn({ name: 'plan_id' })
  plan: SubscriptionPlan;

  @Column()
  plan_id: string;

  @Column({ 
    type: 'enum', 
    enum: GroupStatus,
    default: GroupStatus.ACTIVE
  })
  status: GroupStatus;

  @Column({ type: 'timestamp' })
  start_time: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_time: Date;

  @Column({ default: 0 })
  max_participants: number;

  @Column({ default: false })
  is_public: boolean;

  @Column({ type: 'jsonb', nullable: true })
  settings: {
    show_history?: boolean;
    update_interval?: number; // in seconds
    accuracy_threshold?: number; // in meters
  };

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relationships
  @OneToMany(() => GroupParticipant, participant => participant.group)
  participants: GroupParticipant[];
}
