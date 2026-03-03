import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TrackingGroup } from './tracking-group.entity';

@Entity('location_history')
@Index(['user_id', 'group_id', 'timestamp'])
export class LocationHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: string;

  @ManyToOne(() => TrackingGroup, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: TrackingGroup;

  @Column()
  group_id: string;

  @Column({ type: 'float' })
  latitude: number;

  @Column({ type: 'float' })
  longitude: number;

  @Column({ type: 'float', nullable: true })
  accuracy: number;

  @Column({ type: 'float', nullable: true })
  altitude: number;

  @Column({ type: 'float', nullable: true })
  speed: number;

  @Column({ type: 'float', nullable: true })
  heading: number;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @CreateDateColumn()
  created_at: Date;
}
