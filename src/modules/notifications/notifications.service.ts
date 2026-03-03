import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    Notification,
    NotificationType,
    NotificationPriority,
    NotificationStatus,
    TargetAudience,
    DeliveryMethod,
    FrequencyType
} from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { AUTO_NOTIFICATIONS } from './data/auto-notifications.data';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private notificationRepository: Repository<Notification>,
    ) { }

    async create(createDto: CreateNotificationDto, adminId: string): Promise<Notification> {
        const notificationData: Partial<Notification> = {
            title: createDto.title,
            content: createDto.content,
            type: createDto.type,
            is_system: createDto.is_system || false,
            priority: createDto.priority || NotificationPriority.MEDIUM,
            status: createDto.status || NotificationStatus.ACTIVE,
            target_audience: createDto.target_audience,
            target_details: createDto.target_details || null,
            delivery_methods: createDto.delivery_methods || [DeliveryMethod.IN_APP],
            frequency: createDto.frequency || FrequencyType.ONCE,
            frequency_details: createDto.frequency_details || null,
            image_url: createDto.image_url || null,
            action_url: createDto.action_url || null,
            action_text: createDto.action_text || null,
            show_popup: createDto.show_popup ?? false,
            play_sound: createDto.play_sound ?? false,
            vibrate: createDto.vibrate ?? false,
            scheduled_at: createDto.scheduled_at ? new Date(createDto.scheduled_at) : null,
            expires_at: createDto.expires_at ? new Date(createDto.expires_at) : null,
            template_variables: createDto.template_variables || {},
            created_by_id: adminId,
            updated_by_id: adminId,
        };

        const notification = this.notificationRepository.create(notificationData);
        return await this.notificationRepository.save(notification);
    }

    async initializeAutoNotifications(adminId: string): Promise<void> {
        const count = await this.notificationRepository.count({ where: { is_system: true } });

        if (count === 0) {
            for (const notifData of AUTO_NOTIFICATIONS) {
                const data: Partial<Notification> = {
                    title: notifData.title,
                    content: notifData.content,
                    type: notifData.type,
                    is_system: true,
                    priority: notifData.priority,
                    status: NotificationStatus.ACTIVE,
                    target_audience: notifData.target_audience,
                    delivery_methods: notifData.delivery_methods,
                    frequency: notifData.frequency,
                    frequency_details: notifData.frequency_details || null,
                    image_url: notifData.image_url || null,
                    action_url: notifData.action_url || null,
                    action_text: notifData.action_text || null,
                    show_popup: notifData.show_popup || false,
                    play_sound: notifData.play_sound || false,
                    vibrate: notifData.vibrate || false,
                    template_variables: notifData.template_variables || {},
                    created_by_id: adminId,
                    updated_by_id: adminId,
                    scheduled_at: null,
                    expires_at: null,
                };
                const notification = this.notificationRepository.create(data);
                await this.notificationRepository.save(notification);
            }
        }
    }

    async findAll(
        page: number = 1,
        limit: number = 10,
        type?: string,
        status?: string,
        targetAudience?: string,
        search?: string,
        dateFrom?: string,
        dateTo?: string,
        showSystem?: boolean,
    ): Promise<{ data: Notification[]; total: number; page: number; limit: number }> {
        const queryBuilder = this.notificationRepository.createQueryBuilder('notification')
            .leftJoinAndSelect('notification.created_by', 'created_by')
            .leftJoinAndSelect('notification.updated_by', 'updated_by')
            .orderBy('notification.created_at', 'DESC');

        if (type) {
            queryBuilder.andWhere('notification.type = :type', { type });
        }

        if (status) {
            queryBuilder.andWhere('notification.status = :status', { status });
        }

        if (targetAudience) {
            queryBuilder.andWhere('notification.target_audience = :targetAudience', { targetAudience });
        }

        if (showSystem !== undefined) {
            queryBuilder.andWhere('notification.is_system = :showSystem', { showSystem });
        }

        if (search) {
            queryBuilder.andWhere(
                '(notification.title ILIKE :search OR notification.content ILIKE :search OR created_by.full_name ILIKE :search)',
                { search: `%${search}%` }
            );
        }

        if (dateFrom && dateTo) {
            queryBuilder.andWhere('notification.created_at BETWEEN :dateFrom AND :dateTo', {
                dateFrom: new Date(dateFrom),
                dateTo: new Date(dateTo),
            });
        }

        const [data, total] = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return { data, total, page, limit };
    }

    async findOne(id: string): Promise<Notification> {
        const notification = await this.notificationRepository.findOne({
            where: { id },
            relations: ['created_by', 'updated_by'],
        });

        if (!notification) {
            throw new NotFoundException(`Notification with ID ${id} not found`);
        }

        return notification;
    }

    async update(id: string, updateDto: UpdateNotificationDto, adminId: string): Promise<Notification> {
        const notification = await this.findOne(id);

        // Update fields
        if (updateDto.title !== undefined) notification.title = updateDto.title;
        if (updateDto.content !== undefined) notification.content = updateDto.content;
        if (updateDto.type !== undefined) notification.type = updateDto.type;
        if (updateDto.priority !== undefined) notification.priority = updateDto.priority;
        if (updateDto.status !== undefined) notification.status = updateDto.status;
        if (updateDto.target_audience !== undefined) notification.target_audience = updateDto.target_audience;
        if (updateDto.target_details !== undefined) notification.target_details = updateDto.target_details || null;
        if (updateDto.delivery_methods !== undefined) notification.delivery_methods = updateDto.delivery_methods;
        if (updateDto.frequency !== undefined) notification.frequency = updateDto.frequency;
        if (updateDto.frequency_details !== undefined) notification.frequency_details = updateDto.frequency_details || null;
        if (updateDto.image_url !== undefined) notification.image_url = updateDto.image_url || null;
        if (updateDto.action_url !== undefined) notification.action_url = updateDto.action_url || null;
        if (updateDto.action_text !== undefined) notification.action_text = updateDto.action_text || null;
        if (updateDto.show_popup !== undefined) notification.show_popup = updateDto.show_popup;
        if (updateDto.play_sound !== undefined) notification.play_sound = updateDto.play_sound;
        if (updateDto.vibrate !== undefined) notification.vibrate = updateDto.vibrate;
        if (updateDto.template_variables !== undefined) notification.template_variables = updateDto.template_variables || null;

        // Handle dates
        if (updateDto.scheduled_at !== undefined) {
            notification.scheduled_at = updateDto.scheduled_at ? new Date(updateDto.scheduled_at) : null;
        }
        if (updateDto.expires_at !== undefined) {
            notification.expires_at = updateDto.expires_at ? new Date(updateDto.expires_at) : null;
        }

        notification.updated_by_id = adminId;

        return await this.notificationRepository.save(notification);
    }

    async remove(id: string): Promise<void> {
        const notification = await this.findOne(id);
        await this.notificationRepository.remove(notification);
    }

    async toggleStatus(id: string, adminId: string): Promise<Notification> {
        const notification = await this.findOne(id);
        notification.status = notification.status === NotificationStatus.ACTIVE
            ? NotificationStatus.INACTIVE
            : NotificationStatus.ACTIVE;
        notification.updated_by_id = adminId;
        return await this.notificationRepository.save(notification);
    }

    async toggleSystemVisibility(id: string, adminId: string): Promise<Notification> {
        const notification = await this.findOne(id);
        notification.is_system = !notification.is_system;
        notification.updated_by_id = adminId;
        return await this.notificationRepository.save(notification);
    }

    // Get notifications for a specific user
    // Get notifications for a specific user
    async getUserNotifications(
        userId: string,
        isVerified: boolean,
        subscriptionStatus: string,
        isNewUser: boolean = false,
        isTrialUser: boolean = false
    ): Promise<Notification[]> {
        const now = new Date();

        const queryBuilder = this.notificationRepository.createQueryBuilder('notification')
            .where('notification.status = :status', { status: NotificationStatus.ACTIVE })
            .andWhere('(notification.scheduled_at IS NULL OR notification.scheduled_at <= :now)', { now })
            .andWhere('(notification.expires_at IS NULL OR notification.expires_at >= :now)', { now });

        // Build conditions array
        const conditions: string[] = [];
        const parameters: any = { userId };

        if (isNewUser) {
            conditions.push("notification.target_audience = :newUsers");
            parameters.newUsers = TargetAudience.NEW_USERS;
        }
        if (isVerified) {
            conditions.push("notification.target_audience = :verifiedUsers");
            parameters.verifiedUsers = TargetAudience.VERIFIED_USERS;
        } else {
            conditions.push("notification.target_audience = :unverifiedUsers");
            parameters.unverifiedUsers = TargetAudience.UNVERIFIED_USERS;
        }
        if (subscriptionStatus === 'Active') {
            conditions.push("notification.target_audience = :activeSubscribers");
            parameters.activeSubscribers = TargetAudience.ACTIVE_SUBSCRIBERS;
        } else if (subscriptionStatus === 'Inactive') {
            conditions.push("notification.target_audience = :inactiveSubscribers");
            parameters.inactiveSubscribers = TargetAudience.INACTIVE_SUBSCRIBERS;
        } else if (subscriptionStatus === 'Expired') {
            conditions.push("notification.target_audience = :expiredSubscribers");
            parameters.expiredSubscribers = TargetAudience.EXPIRED_SUBSCRIBERS;
        }
        if (isTrialUser) {
            conditions.push("notification.target_audience = :trialUsers");
            parameters.trialUsers = TargetAudience.TRIAL_USERS;
        }

        conditions.push("notification.target_audience = :allUsers");
        parameters.allUsers = TargetAudience.ALL_USERS;

        conditions.push(
            "(notification.target_audience = :specificUser AND notification.target_details->>'specific_user_id' = :userId)"
        );
        parameters.specificUser = TargetAudience.SPECIFIC_USER;

        queryBuilder.andWhere(`(${conditions.join(' OR ')})`, parameters);

        return queryBuilder
            .orderBy('notification.priority', 'DESC')
            .addOrderBy('notification.created_at', 'DESC')
            .getMany();
    }

    async trackView(id: string): Promise<void> {
        await this.notificationRepository.increment({ id }, 'view_count', 1);
    }

    async trackClick(id: string): Promise<void> {
        await this.notificationRepository.increment({ id }, 'click_count', 1);
    }
}