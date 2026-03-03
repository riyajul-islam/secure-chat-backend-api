import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement, TargetAudience } from './entities/announcement.entity';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

@Injectable()
export class AnnouncementsService {
    constructor(
        @InjectRepository(Announcement)
        private announcementRepository: Repository<Announcement>,
    ) { }

    async create(createDto: CreateAnnouncementDto, adminId: string): Promise<Announcement> {
        // Validate media based on type
        if (createDto.media_type === 'image' && !createDto.media_url) {
            throw new BadRequestException('Media URL is required for image type');
        }
        if (createDto.media_type === 'youtube' && !createDto.youtube_url) {
            throw new BadRequestException('YouTube URL is required');
        }
        if (createDto.media_type === 'vimeo' && !createDto.vimeo_url) {
            throw new BadRequestException('Vimeo URL is required');
        }
        if (createDto.media_type === 'video' && !createDto.media_url) {
            throw new BadRequestException('Video URL is required');
        }

        // Prepare announcement data with proper null handling for dates
        const announcementData = {
            title: createDto.title,
            description: createDto.description,
            media_type: createDto.media_type,
            media_url: createDto.media_url,
            youtube_url: createDto.youtube_url,
            vimeo_url: createDto.vimeo_url,
            learn_more_text: createDto.learn_more_text || 'Learn More',
            learn_more_url: createDto.learn_more_url,
            target_audience: createDto.target_audience,
            specific_user_id: createDto.specific_user_id,
            is_active: createDto.is_active ?? true,
            scheduled_at: createDto.scheduled_at ? new Date(createDto.scheduled_at) : null,
            expires_at: createDto.expires_at ? new Date(createDto.expires_at) : null,
            preview_image_url: createDto.preview_image_url,
            created_by_id: adminId,
            updated_by_id: adminId,
        };

        const announcement = this.announcementRepository.create(announcementData);
        return await this.announcementRepository.save(announcement);
    }

    async findAll(
        page: number = 1,
        limit: number = 10,
        targetAudience?: TargetAudience,
        search?: string,
        dateFrom?: string,
        dateTo?: string,
    ): Promise<{ data: Announcement[]; total: number; page: number; limit: number }> {
        const queryBuilder = this.announcementRepository.createQueryBuilder('announcement')
            .leftJoinAndSelect('announcement.created_by', 'created_by')
            .leftJoinAndSelect('announcement.updated_by', 'updated_by');

        if (targetAudience) {
            queryBuilder.andWhere('announcement.target_audience = :targetAudience', { targetAudience });
        }

        if (search) {
            queryBuilder.andWhere(
                '(announcement.title ILIKE :search OR announcement.description ILIKE :search)',
                { search: `%${search}%` }
            );
        }

        if (dateFrom && dateTo) {
            queryBuilder.andWhere('announcement.created_at BETWEEN :dateFrom AND :dateTo', {
                dateFrom: new Date(dateFrom),
                dateTo: new Date(dateTo),
            });
        }

        const [data, total] = await queryBuilder
            .orderBy('announcement.created_at', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return { data, total, page, limit };
    }

    async findOne(id: string): Promise<Announcement> {
        const announcement = await this.announcementRepository.findOne({
            where: { id },
            relations: ['created_by', 'updated_by'],
        });

        if (!announcement) {
            throw new NotFoundException(`Announcement with ID ${id} not found`);
        }

        return announcement;
    }

    async update(id: string, updateDto: UpdateAnnouncementDto, adminId: string): Promise<Announcement> {
        const announcement = await this.findOne(id);

        // Update fields
        if (updateDto.title !== undefined) announcement.title = updateDto.title;
        if (updateDto.description !== undefined) announcement.description = updateDto.description;
        if (updateDto.media_type !== undefined) announcement.media_type = updateDto.media_type;
        if (updateDto.media_url !== undefined) announcement.media_url = updateDto.media_url;
        if (updateDto.youtube_url !== undefined) announcement.youtube_url = updateDto.youtube_url;
        if (updateDto.vimeo_url !== undefined) announcement.vimeo_url = updateDto.vimeo_url;
        if (updateDto.learn_more_text !== undefined) announcement.learn_more_text = updateDto.learn_more_text;
        if (updateDto.learn_more_url !== undefined) announcement.learn_more_url = updateDto.learn_more_url;
        if (updateDto.target_audience !== undefined) announcement.target_audience = updateDto.target_audience;
        if (updateDto.specific_user_id !== undefined) announcement.specific_user_id = updateDto.specific_user_id;
        if (updateDto.is_active !== undefined) announcement.is_active = updateDto.is_active;
        if (updateDto.preview_image_url !== undefined) announcement.preview_image_url = updateDto.preview_image_url;

        // Handle dates with proper null handling - now matches Date | null type
        if (updateDto.scheduled_at !== undefined) {
            announcement.scheduled_at = updateDto.scheduled_at ? new Date(updateDto.scheduled_at) : null;
        }
        if (updateDto.expires_at !== undefined) {
            announcement.expires_at = updateDto.expires_at ? new Date(updateDto.expires_at) : null;
        }

        announcement.updated_by_id = adminId;

        return await this.announcementRepository.save(announcement);
    }

    async remove(id: string): Promise<void> {
        const announcement = await this.findOne(id);
        await this.announcementRepository.remove(announcement);
    }

    async toggleStatus(id: string, adminId: string): Promise<Announcement> {
        const announcement = await this.findOne(id);
        announcement.is_active = !announcement.is_active;
        announcement.updated_by_id = adminId;
        return await this.announcementRepository.save(announcement);
    }

    // For Flutter app - get active announcements for specific user
    async getUserAnnouncements(userId: string, isVerified: boolean, subscriptionStatus: string): Promise<Announcement[]> {
        const now = new Date();

        const queryBuilder = this.announcementRepository.createQueryBuilder('announcement')
            .where('announcement.is_active = :isActive', { isActive: true })
            .andWhere('(announcement.scheduled_at IS NULL OR announcement.scheduled_at <= :now)', { now })
            .andWhere('(announcement.expires_at IS NULL OR announcement.expires_at >= :now)', { now });

        // Filter by target audience
        queryBuilder.andWhere(
            `(announcement.target_audience = :allUsers
        OR (announcement.target_audience = :specificUser AND announcement.specific_user_id = :userId)
        OR (announcement.target_audience = :verifiedUsers AND :isVerified = true)
        OR (announcement.target_audience = :unverifiedUsers AND :isVerified = false)
        OR (announcement.target_audience = :activeSubscribers AND :subscriptionStatus = 'Active')
        OR (announcement.target_audience = :inactiveSubscribers AND :subscriptionStatus = 'Inactive')
        OR (announcement.target_audience = :expiredSubscribers AND :subscriptionStatus = 'Expired'))`,
            {
                allUsers: TargetAudience.ALL_USERS,
                specificUser: TargetAudience.SPECIFIC_USER,
                verifiedUsers: TargetAudience.VERIFIED_USERS,
                unverifiedUsers: TargetAudience.UNVERIFIED_USERS,
                activeSubscribers: TargetAudience.ACTIVE_SUBSCRIBERS,
                inactiveSubscribers: TargetAudience.INACTIVE_SUBSCRIBERS,
                expiredSubscribers: TargetAudience.EXPIRED_SUBSCRIBERS,
                userId,
                isVerified,
                subscriptionStatus
            }
        );

        return queryBuilder
            .orderBy('announcement.created_at', 'DESC')
            .getMany();
    }

    async incrementViewCount(id: string): Promise<void> {
        await this.announcementRepository.increment({ id }, 'view_count', 1);
    }

    async incrementClickCount(id: string): Promise<void> {
        await this.announcementRepository.increment({ id }, 'click_count', 1);
    }
}