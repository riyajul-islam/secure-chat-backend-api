import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan } from 'typeorm';
import { TrackingGroup } from './entities/tracking-group.entity';
import { GroupParticipant } from './entities/group-participant.entity';
import { LocationHistory } from './entities/location-history.entity';
import { CreateTrackingGroupDto } from './dto/create-tracking-group.dto';
import { AddParticipantDto } from './dto/add-participant.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { ProcessInviteDto } from './dto/process-invite.dto';
import { GroupStatus, ParticipantStatus, ParticipantRole } from './enums/tracking.enum';
import { User } from '../users/entities/user.entity';
import { UserSubscriptionService } from '../subscriptions/user-subscription.service';

@Injectable()
export class GpsTrackingService {
  constructor(
    @InjectRepository(TrackingGroup)
    private groupRepository: Repository<TrackingGroup>,
    @InjectRepository(GroupParticipant)
    private participantRepository: Repository<GroupParticipant>,
    @InjectRepository(LocationHistory)
    private locationRepository: Repository<LocationHistory>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private userSubscriptionService: UserSubscriptionService,
  ) {}

  async createGroup(hostId: string, createDto: CreateTrackingGroupDto): Promise<TrackingGroup> {
    // Check if user has GPS tracking permission
    const subscription = await this.userSubscriptionService.getActiveSubscription(hostId);
    
    if (!subscription || !subscription.plan.has_gps_tracking) {
      throw new ForbiddenException('Your subscription does not include GPS tracking');
    }

    // Check remaining tracking groups
    const activeGroupsCount = await this.groupRepository.count({
      where: {
        host_id: hostId,
        status: GroupStatus.ACTIVE,
      },
    });

    if (activeGroupsCount >= subscription.plan.max_tracking_groups) {
      throw new BadRequestException(`You have reached the maximum limit of ${subscription.plan.max_tracking_groups} active tracking groups`);
    }

    // Check max participants limit
    if (createDto.max_participants > subscription.plan.max_tracked_users_per_group) {
      throw new BadRequestException(`Maximum participants cannot exceed ${subscription.plan.max_tracked_users_per_group} based on your plan`);
    }

    const group = this.groupRepository.create({
      host_id: hostId,
      plan_id: subscription.plan_id,
      start_time: new Date(),
      end_time: new Date(Date.now() + createDto.duration * 1000),
      ...createDto,
    });

    const savedGroup = await this.groupRepository.save(group);

    // Add host as participant
    const participant = this.participantRepository.create({
      group_id: savedGroup.id,
      user_id: hostId,
      role: ParticipantRole.HOST,
      status: ParticipantStatus.ACCEPTED,
      joined_at: new Date(),
    });
    await this.participantRepository.save(participant);

    return savedGroup;
  }

  async getGroup(groupId: string, userId: string): Promise<TrackingGroup> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['host', 'participants', 'participants.user'],
    });

    if (!group) {
      throw new NotFoundException('Tracking group not found');
    }

    // Check if user is part of the group
    const isParticipant = group.participants.some(p => p.user_id === userId);
    if (!isParticipant && group.host_id !== userId) {
      throw new ForbiddenException('You are not a member of this group');
    }

    return group;
  }

  async getUserGroups(userId: string): Promise<TrackingGroup[]> {
    const participations = await this.participantRepository.find({
      where: { user_id: userId },
      relations: ['group', 'group.host'],
    });

    return participations.map(p => p.group);
  }

  async addParticipant(
    groupId: string, 
    hostId: string, 
    addDto: AddParticipantDto
  ): Promise<GroupParticipant> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId, host_id: hostId },
    });

    if (!group) {
      throw new NotFoundException('Group not found or you are not the host');
    }

    if (group.status !== GroupStatus.ACTIVE) {
      throw new BadRequestException('Group is not active');
    }

    // Check if already added
    const existing = await this.participantRepository.findOne({
      where: {
        group_id: groupId,
        user_id: addDto.user_id,
      },
    });

    if (existing) {
      throw new BadRequestException('User already added to group');
    }

    // Check participant limit
    const participantCount = await this.participantRepository.count({
      where: { group_id: groupId, status: ParticipantStatus.ACCEPTED },
    });

    if (participantCount >= group.max_participants) {
      throw new BadRequestException('Group has reached maximum participants');
    }

    const participant = this.participantRepository.create({
      group_id: groupId,
      user_id: addDto.user_id,
      status: ParticipantStatus.PENDING,
    });

    return this.participantRepository.save(participant);
  }

  async processInvite(
    participantId: string,
    userId: string,
    processDto: ProcessInviteDto
  ): Promise<GroupParticipant> {
    const participant = await this.participantRepository.findOne({
      where: { id: participantId, user_id: userId },
      relations: ['group'],
    });

    if (!participant) {
      throw new NotFoundException('Invite not found');
    }

    if (participant.status !== ParticipantStatus.PENDING) {
      throw new BadRequestException('Invite already processed');
    }

    participant.status = processDto.status;
    if (processDto.status === ParticipantStatus.ACCEPTED) {
      participant.joined_at = new Date();
    }

    return this.participantRepository.save(participant);
  }

    async updateLocation(
    userId: string,
    groupId: string,
    locationDto: UpdateLocationDto
    ): Promise<LocationHistory> {
    // Check if user is active participant
    const participant = await this.participantRepository.findOne({
        where: {
        group_id: groupId,
        user_id: userId,
        status: ParticipantStatus.ACCEPTED,
        },
        relations: ['group'],
    });

    if (!participant) {
        throw new ForbiddenException('You are not an active participant of this group');
    }

    if (participant.group.status !== GroupStatus.ACTIVE) {
        throw new BadRequestException('Group is not active');
    }

    if (participant.group.end_time < new Date()) {
        throw new BadRequestException('Group session has expired');
    }

    // Update participant's last location
    participant.last_location = {
        latitude: locationDto.latitude,
        longitude: locationDto.longitude,
        accuracy: locationDto.accuracy || 0,
        altitude: locationDto.altitude,      // ← এখন কাজ করবে
        speed: locationDto.speed,
        heading: locationDto.heading,
        timestamp: new Date(),
    };
    await this.participantRepository.save(participant);

    // Save to history
    const location = this.locationRepository.create({
        user_id: userId,
        group_id: groupId,
        latitude: locationDto.latitude,
        longitude: locationDto.longitude,
        accuracy: locationDto.accuracy,
        altitude: locationDto.altitude,      // ← এখন কাজ করবে
        speed: locationDto.speed,
        heading: locationDto.heading,
        timestamp: new Date(),
    });

    return this.locationRepository.save(location);
    }

  async getGroupLocations(groupId: string, userId: string): Promise<any> {
    const group = await this.getGroup(groupId, userId);

    const participants = await this.participantRepository.find({
      where: {
        group_id: groupId,
        status: ParticipantStatus.ACCEPTED,
      },
      relations: ['user'],
    });

    return participants.map(p => ({
      user_id: p.user_id,
      user_name: p.user.name,
      last_location: p.last_location,
      role: p.role,
    }));
  }

  async getLocationHistory(
    groupId: string,
    userId: string,
    startTime?: Date,
    endTime?: Date
  ): Promise<LocationHistory[]> {
    await this.getGroup(groupId, userId);

    const where: any = {
      group_id: groupId,
    };

    if (startTime && endTime) {
      where.timestamp = Between(startTime, endTime);
    }

    return this.locationRepository.find({
      where,
      order: { timestamp: 'ASC' },
    });
  }

  async endGroup(groupId: string, hostId: string): Promise<TrackingGroup> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId, host_id: hostId },
    });

    if (!group) {
      throw new NotFoundException('Group not found or you are not the host');
    }

    group.status = GroupStatus.CANCELLED;
    group.end_time = new Date();

    return this.groupRepository.save(group);
  }

  async leaveGroup(groupId: string, userId: string): Promise<void> {
    const participant = await this.participantRepository.findOne({
      where: { group_id: groupId, user_id: userId },
    });

    if (!participant) {
      throw new NotFoundException('You are not a member of this group');
    }

    if (participant.role === ParticipantRole.HOST) {
      throw new BadRequestException('Host cannot leave group. End the group instead.');
    }

    participant.status = ParticipantStatus.LEFT;
    participant.left_at = new Date();
    await this.participantRepository.save(participant);
  }

  async cleanupExpiredGroups(): Promise<void> {
    await this.groupRepository.update(
      {
        status: GroupStatus.ACTIVE,
        end_time: LessThan(new Date()),
      },
      {
        status: GroupStatus.EXPIRED,
      }
    );
  }

  async getUserInvites(userId: string): Promise<GroupParticipant[]> {
    return this.participantRepository.find({
      where: {
        user_id: userId,
        status: ParticipantStatus.PENDING,
      },
      relations: ['group', 'group.host'],
      order: { created_at: 'DESC' },
    });
  }
}
