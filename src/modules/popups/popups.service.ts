import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Popup, PopupType, TargetAudience, PopupStatus } from './entities/popup.entity';
import { CreatePopupDto } from './dto/create-popup.dto';
import { UpdatePopupDto } from './dto/update-popup.dto';
import { SYSTEM_POPUPS } from '../data/system-popups.data';

@Injectable()
export class PopupsService {
  constructor(
    @InjectRepository(Popup)
    private popupRepository: Repository<Popup>,
  ) {}

  async create(createDto: CreatePopupDto, adminId: string): Promise<Popup> {
    console.log('========== CREATE POPUP ==========');
    console.log('Admin ID:', adminId);
    console.log('Received DTO:', JSON.stringify(createDto, null, 2));

    // Check each required field
    if (!createDto.title) console.error('❌ Title is missing');
    if (!createDto.content) console.error('❌ Content is missing');
    if (!createDto.type) console.error('❌ Type is missing');
    if (!createDto.target_audience) console.error('❌ Target audience is missing');
    if (!createDto.display_frequency) console.error('❌ Display frequency is missing');

    // Build the popup data object
    const popupData: Partial<Popup> = {
      title: createDto.title,
      content: createDto.content,
      type: createDto.type,
      is_system: createDto.is_system || false,
      target_audience: createDto.target_audience,
      specific_user_id: createDto.specific_user_id || null,
      display_frequency: createDto.display_frequency,
      image_url: createDto.image_url || null,
      video_url: createDto.video_url || null,
      action_button_text: createDto.action_button_text || null,
      action_button_link: createDto.action_button_link || null,
      show_close_button: createDto.show_close_button ?? true,
      close_button_text: createDto.close_button_text || null,
      auto_close_seconds: createDto.auto_close_seconds ?? 5,
      show_notification: createDto.show_notification || false,
      notification_text: createDto.notification_text || null,
      notification_delay_seconds: createDto.notification_delay_seconds ?? 3,
      status: createDto.status || PopupStatus.DRAFT,
      start_date: createDto.start_date ? new Date(createDto.start_date) : null,
      end_date: createDto.end_date ? new Date(createDto.end_date) : null,
      priority: createDto.priority || 0,
      settings: createDto.settings || {
        width: '400px',
        height: 'auto',
        position: 'center',
        overlay: true,
        animation: 'fade'
      },
      created_by_id: adminId,
      updated_by_id: adminId,
    };

    console.log('Processed popup data:', JSON.stringify(popupData, null, 2));

    try {
      const popup = this.popupRepository.create(popupData);
      console.log('Created popup entity:', JSON.stringify(popup, null, 2));
      const saved = await this.popupRepository.save(popup);
      console.log('✅ Popup saved successfully with ID:', saved.id);
      return saved;
    } catch (error) {
      console.error('❌ Error saving popup:', error);
      throw error;
    }
  }

  async initializeSystemPopups(adminId: string): Promise<void> {
    const count = await this.popupRepository.count({ where: { is_system: true } });

    if (count === 0) {
      for (const popupData of SYSTEM_POPUPS) {
        const data: Partial<Popup> = {
          title: popupData.title,
          content: popupData.content,
          type: popupData.type,
          is_system: true,
          target_audience: popupData.target_audience,
          specific_user_id: null,
          display_frequency: popupData.display_frequency,
          image_url: popupData.image_url,
          video_url: popupData.video_url,
          action_button_text: popupData.action_button_text,
          action_button_link: popupData.action_button_link,
          show_close_button: popupData.show_close_button,
          close_button_text: popupData.close_button_text,
          auto_close_seconds: popupData.auto_close_seconds,
          show_notification: popupData.show_notification,
          notification_text: popupData.notification_text,
          notification_delay_seconds: popupData.notification_delay_seconds,
          status: popupData.status,
          priority: popupData.priority,
          settings: popupData.settings,
          start_date: null,
          end_date: null,
          created_by_id: adminId,
          updated_by_id: adminId,
        };
        const popup = this.popupRepository.create(data);
        await this.popupRepository.save(popup);
      }
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    type?: PopupType,
    status?: PopupStatus,
    targetAudience?: TargetAudience,
    search?: string,
  ): Promise<{ data: Popup[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.popupRepository.createQueryBuilder('popup')
      .leftJoinAndSelect('popup.created_by', 'created_by')
      .leftJoinAndSelect('popup.updated_by', 'updated_by');

    if (type) {
      queryBuilder.andWhere('popup.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('popup.status = :status', { status });
    }

    if (targetAudience) {
      queryBuilder.andWhere('popup.target_audience = :targetAudience', { targetAudience });
    }

    if (search) {
      queryBuilder.andWhere(
        '(popup.title ILIKE :search OR popup.content ILIKE :search OR created_by.full_name ILIKE :search OR updated_by.full_name ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [data, total] = await queryBuilder
      .orderBy('popup.priority', 'DESC')
      .addOrderBy('popup.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Popup> {
    const popup = await this.popupRepository.findOne({
      where: { id },
      relations: ['created_by', 'updated_by'],
    });

    if (!popup) {
      throw new NotFoundException(`Popup with ID ${id} not found`);
    }

    return popup;
  }

  async update(id: string, updateDto: UpdatePopupDto, adminId: string): Promise<Popup> {
    const popup = await this.findOne(id);

    // Update fields only if they are provided
    if (updateDto.title !== undefined) popup.title = updateDto.title;
    if (updateDto.content !== undefined) popup.content = updateDto.content;
    if (updateDto.type !== undefined) popup.type = updateDto.type;
    if (updateDto.target_audience !== undefined) popup.target_audience = updateDto.target_audience;
    if (updateDto.specific_user_id !== undefined) popup.specific_user_id = updateDto.specific_user_id || null;
    if (updateDto.display_frequency !== undefined) popup.display_frequency = updateDto.display_frequency;
    if (updateDto.image_url !== undefined) popup.image_url = updateDto.image_url || null;
    if (updateDto.video_url !== undefined) popup.video_url = updateDto.video_url || null;
    if (updateDto.action_button_text !== undefined) popup.action_button_text = updateDto.action_button_text || null;
    if (updateDto.action_button_link !== undefined) popup.action_button_link = updateDto.action_button_link || null;
    if (updateDto.show_close_button !== undefined) popup.show_close_button = updateDto.show_close_button;
    if (updateDto.close_button_text !== undefined) popup.close_button_text = updateDto.close_button_text || null;
    if (updateDto.auto_close_seconds !== undefined) popup.auto_close_seconds = updateDto.auto_close_seconds;
    if (updateDto.show_notification !== undefined) popup.show_notification = updateDto.show_notification;
    if (updateDto.notification_text !== undefined) popup.notification_text = updateDto.notification_text || null;
    if (updateDto.notification_delay_seconds !== undefined) popup.notification_delay_seconds = updateDto.notification_delay_seconds;
    if (updateDto.status !== undefined) popup.status = updateDto.status;
    if (updateDto.priority !== undefined) popup.priority = updateDto.priority;
    if (updateDto.settings !== undefined) popup.settings = updateDto.settings;

    // Handle dates
    if (updateDto.start_date !== undefined) {
      popup.start_date = updateDto.start_date ? new Date(updateDto.start_date) : null;
    }
    if (updateDto.end_date !== undefined) {
      popup.end_date = updateDto.end_date ? new Date(updateDto.end_date) : null;
    }

    popup.updated_by_id = adminId;

    return await this.popupRepository.save(popup);
  }

  async remove(id: string): Promise<void> {
    const popup = await this.findOne(id);
    await this.popupRepository.remove(popup);
  }

  async toggleStatus(id: string, adminId: string): Promise<Popup> {
    const popup = await this.findOne(id);
    popup.status = popup.status === PopupStatus.ACTIVE 
      ? PopupStatus.PAUSED 
      : PopupStatus.ACTIVE;
    popup.updated_by_id = adminId;
    return await this.popupRepository.save(popup);
  }

  async getUserPopups(
    userId: string,
    isVerified: boolean,
    subscriptionStatus: string,
    isNewUser: boolean = false,
    isTrialUser: boolean = false
  ): Promise<Popup[]> {
    const now = new Date();

    const queryBuilder = this.popupRepository.createQueryBuilder('popup')
      .where('popup.status = :status', { status: PopupStatus.ACTIVE })
      .andWhere('(popup.start_date IS NULL OR popup.start_date <= :now)', { now })
      .andWhere('(popup.end_date IS NULL OR popup.end_date >= :now)', { now });

    queryBuilder.andWhere(
      `(popup.target_audience = :allUsers
        OR (popup.target_audience = :specificUser AND popup.specific_user_id = :userId)
        OR (popup.target_audience = :newUsers AND :isNewUser = true)
        OR (popup.target_audience = :verifiedUsers AND :isVerified = true)
        OR (popup.target_audience = :unverifiedUsers AND :isVerified = false)
        OR (popup.target_audience = :activeSubscribers AND :subscriptionStatus = 'Active')
        OR (popup.target_audience = :inactiveSubscribers AND :subscriptionStatus = 'Inactive')
        OR (popup.target_audience = :expiredSubscribers AND :subscriptionStatus = 'Expired')
        OR (popup.target_audience = :trialUsers AND :isTrialUser = true))`,
      {
        allUsers: TargetAudience.ALL_USERS,
        specificUser: TargetAudience.SPECIFIC_USER,
        newUsers: TargetAudience.NEW_USERS,
        verifiedUsers: TargetAudience.VERIFIED_USERS,
        unverifiedUsers: TargetAudience.UNVERIFIED_USERS,
        activeSubscribers: TargetAudience.ACTIVE_SUBSCRIBERS,
        inactiveSubscribers: TargetAudience.INACTIVE_SUBSCRIBERS,
        expiredSubscribers: TargetAudience.EXPIRED_SUBSCRIBERS,
        trialUsers: TargetAudience.TRIAL_USERS,
        userId,
        isNewUser,
        isVerified,
        subscriptionStatus
      }
    );

    return queryBuilder
      .orderBy('popup.priority', 'DESC')
      .addOrderBy('popup.created_at', 'DESC')
      .getMany();
  }

  async trackView(id: string): Promise<void> {
    await this.popupRepository.increment({ id }, 'view_count', 1);
  }

  async trackClick(id: string): Promise<void> {
    await this.popupRepository.increment({ id }, 'click_count', 1);
  }

  async trackClose(id: string): Promise<void> {
    await this.popupRepository.increment({ id }, 'close_count', 1);
  }
}