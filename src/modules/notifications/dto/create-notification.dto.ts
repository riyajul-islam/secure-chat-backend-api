import { IsString, IsOptional, IsEnum, IsBoolean, IsArray, IsObject, IsDateString, IsUUID, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
    NotificationType,
    NotificationPriority,
    NotificationStatus,
    TargetAudience,
    DeliveryMethod,
    FrequencyType
} from '../entities/notification.entity';

export class CreateNotificationDto {
    @ApiProperty({ example: 'Welcome to Our App!' })
    @IsString()
    title: string;

    @ApiProperty({ example: 'Thank you for joining us...' })
    @IsString()
    content: string;

    @ApiProperty({ enum: NotificationType, example: NotificationType.ACCOUNT_CREATED })
    @IsEnum(NotificationType)
    type: NotificationType;

    @ApiProperty({ default: false })
    @IsOptional()
    @IsBoolean()
    is_system?: boolean;

    @ApiProperty({ enum: NotificationPriority, default: NotificationPriority.MEDIUM })
    @IsOptional()
    @IsEnum(NotificationPriority)
    priority?: NotificationPriority;

    @ApiProperty({ enum: NotificationStatus, default: NotificationStatus.ACTIVE })
    @IsOptional()
    @IsEnum(NotificationStatus)
    status?: NotificationStatus;

    @ApiProperty({ enum: TargetAudience, example: TargetAudience.ALL_USERS })
    @IsEnum(TargetAudience)
    target_audience: TargetAudience;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsObject()
    target_details?: {
        specific_user_id?: string;
        user_ids?: string[];
        roles?: string[];
        subscription_types?: string[];
    };

    @ApiProperty({ enum: DeliveryMethod, isArray: true, default: [DeliveryMethod.IN_APP] })
    @IsOptional()
    @IsArray()
    @IsEnum(DeliveryMethod, { each: true })
    delivery_methods?: DeliveryMethod[];

    @ApiProperty({ enum: FrequencyType, default: FrequencyType.ONCE })
    @IsOptional()
    @IsEnum(FrequencyType)
    frequency?: FrequencyType;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsObject()
    frequency_details?: {
        interval_days?: number;
        interval_hours?: number;
        specific_days?: string[];
        specific_time?: string;
        start_date?: Date;
        end_date?: Date;
    };

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    image_url?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    action_url?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    action_text?: string;

    @ApiProperty({ default: false })
    @IsOptional()
    @IsBoolean()
    show_popup?: boolean;

    @ApiProperty({ default: false })
    @IsOptional()
    @IsBoolean()
    play_sound?: boolean;

    @ApiProperty({ default: false })
    @IsOptional()
    @IsBoolean()
    vibrate?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsDateString()
    scheduled_at?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsDateString()
    expires_at?: string;

    @ApiProperty({ required: false, type: Object })
    @IsOptional()
    @IsObject()
    template_variables?: Record<string, any>;
}