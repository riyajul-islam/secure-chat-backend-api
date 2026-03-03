import { IsString, IsOptional, IsEnum, IsBoolean, IsDateString, IsUUID, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TargetAudience, MediaType } from '../entities/announcement.entity';

export class CreateAnnouncementDto {
  @ApiProperty({ example: 'New Feature Release' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Check out our latest feature...' })
  @IsString()
  description: string;

  @ApiProperty({ enum: MediaType, example: MediaType.IMAGE })
  @IsEnum(MediaType)
  media_type: MediaType;

  @ApiProperty({ required: false, example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsUrl()
  @IsString()
  media_url?: string;

  @ApiProperty({ required: false, example: 'https://youtube.com/watch?v=...' })
  @IsOptional()
  @IsUrl()
  @IsString()
  youtube_url?: string;

  @ApiProperty({ required: false, example: 'https://vimeo.com/...' })
  @IsOptional()
  @IsUrl()
  @IsString()
  vimeo_url?: string;

  @ApiProperty({ required: false, example: 'Learn More' })
  @IsOptional()
  @IsString()
  learn_more_text?: string;

  @ApiProperty({ required: false, example: 'https://example.com/learn-more' })
  @IsOptional()
  @IsUrl()
  @IsString()
  learn_more_url?: string;

  @ApiProperty({ enum: TargetAudience, example: TargetAudience.ALL_USERS })
  @IsEnum(TargetAudience)
  target_audience: TargetAudience;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  specific_user_id?: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  scheduled_at?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  expires_at?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  @IsString()
  preview_image_url?: string;
}