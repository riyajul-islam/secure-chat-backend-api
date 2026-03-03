import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber, IsDateString, Min, Max, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PopupType, TargetAudience, DisplayFrequency, PopupStatus } from '../entities/popup.entity';

export class CreatePopupDto {
  @ApiProperty({ example: 'Welcome to Our App!' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Thank you for joining us...' })
  @IsString()
  content: string;

  @ApiProperty({ enum: PopupType, example: PopupType.CUSTOM })
  @IsEnum(PopupType)
  type: PopupType;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  is_system?: boolean;

  @ApiProperty({ enum: TargetAudience, example: TargetAudience.ALL_USERS })
  @IsEnum(TargetAudience)
  target_audience: TargetAudience;

  @ApiProperty({ required: false, example: '811111' })
  @IsOptional()
  @IsString()  // Changed from @IsUUID()
  specific_user_id?: string;

  @ApiProperty({ enum: DisplayFrequency, example: DisplayFrequency.ONCE })
  @IsEnum(DisplayFrequency)
  display_frequency: DisplayFrequency;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  image_url?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  video_url?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  action_button_text?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  action_button_link?: string;

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  show_close_button?: boolean;

  @ApiProperty({ required: false, default: 'Close' })
  @IsOptional()
  @IsString()
  close_button_text?: string;

  @ApiProperty({ default: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(60)
  auto_close_seconds?: number;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  show_notification?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notification_text?: string;

  @ApiProperty({ default: 3 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(30)
  notification_delay_seconds?: number;

  @ApiProperty({ enum: PopupStatus, default: PopupStatus.DRAFT })
  @IsOptional()
  @IsEnum(PopupStatus)
  status?: PopupStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiProperty({ default: 0 })
  @IsOptional()
  @IsNumber()
  priority?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  settings?: {
    width?: string;
    height?: string;
    position?: 'center' | 'top' | 'bottom';
    overlay?: boolean;
    animation?: 'fade' | 'slide' | 'zoom';
  };
}