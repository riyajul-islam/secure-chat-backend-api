import { IsString, IsNumber, IsOptional, IsArray, IsBoolean, Min, IsEnum, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BillingCycle, PlanType, UserLimitType, TrackingPermission } from '../enums/subscription.enum';

export class CreatePlanDto {
  @ApiProperty({ example: 'Professional Plan' })
  @IsString()
  name: string;

  @ApiProperty({ enum: PlanType, example: PlanType.PROFESSIONAL })
  @IsEnum(PlanType)
  type: PlanType;

  // Credit System
  @ApiProperty({ example: 500 })
  @IsNumber()
  @Min(0)
  credits: number;

  @ApiProperty({ example: 6.00 })
  @IsNumber()
  @Min(0)
  usd_price: number;

  @ApiProperty({ example: 500 })
  @IsNumber()
  @Min(0)
  bdt_price: number;

  @ApiProperty({ enum: BillingCycle, example: BillingCycle.MONTHLY })
  @IsEnum(BillingCycle)
  billing_cycle: BillingCycle;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: ['Priority Support', 'Analytics Dashboard'] })
  @IsOptional()
  @IsArray()
  features?: string[];

  // User Limit
  @ApiProperty({ enum: UserLimitType, example: UserLimitType.TEN })
  @IsEnum(UserLimitType)
  user_limit_type: UserLimitType;

  @ApiProperty({ required: false, example: 15 })
  @ValidateIf(o => o.user_limit_type === UserLimitType.CUSTOM)
  @IsNumber()
  @Min(1)
  custom_user_limit?: number;

  // Group Features
  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  can_group_call?: boolean;

  @ApiProperty({ example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  max_groups?: number;

  @ApiProperty({ example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  max_group_members?: number;

  // GPS Tracking
  @ApiProperty({ example: false })
  @IsOptional()
  @IsBoolean()
  has_gps_tracking?: boolean;

  @ApiProperty({ enum: TrackingPermission, example: TrackingPermission.CANNOT_TRACK })
  @IsOptional()
  @IsEnum(TrackingPermission)
  gps_tracking_permission?: TrackingPermission;

  @ApiProperty({ required: false, example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  max_tracking_groups?: number;

  @ApiProperty({ required: false, example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  max_tracked_users_per_group?: number;

  // Hidden features (optional in DTO)
  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  high_security?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  unlimited_message?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  unlimited_attachments?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  unlimited_storage?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  unlimited_calls?: boolean;
}