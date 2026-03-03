import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsArray, Min, Max, IsDateString, ValidateNested, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { VerificationPlanStatus, TimeUnit, DocumentType } from '../entities/verification-plan.entity';

class RequiredDocumentDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  label: string;

  @ApiProperty({ enum: DocumentType })
  @IsEnum(DocumentType)
  type: DocumentType;

  @ApiProperty()
  @IsBoolean()
  required: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  placeholder?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    acceptedFiles?: string[];
    maxSize?: number;
  };
}

export class CreateVerificationPlanDto {
  @ApiProperty({ example: 'Basic Verification' })
  @IsString()
  name: string;

  @ApiProperty({ required: false, example: '6 months verification plan' })
  @IsOptional()
  @IsString()
  description?: string;

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

  @ApiProperty({ enum: TimeUnit, example: TimeUnit.MONTHS })
  @IsEnum(TimeUnit)
  time_unit: TimeUnit;

  @ApiProperty({ example: 6 })
  @IsNumber()
  @Min(1)
  time_value: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  custom_time_value?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  custom_time_unit?: string;

  // Schedule system
  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  is_offer?: boolean;

  @ApiProperty({ required: false })
  @ValidateIf(o => o.is_offer === true)
  @IsDateString()
  offer_start_date?: string;

  @ApiProperty({ required: false })
  @ValidateIf(o => o.is_offer === true)
  @IsDateString()
  offer_end_date?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  offer_discount_percentage?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  offer_badge_text?: string;

  // Email verification
  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  require_email_verification?: boolean;

  // Documents required
  @ApiProperty({ type: [RequiredDocumentDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequiredDocumentDto)
  required_documents?: RequiredDocumentDto[];

  @ApiProperty({ enum: VerificationPlanStatus, default: VerificationPlanStatus.ACTIVE })
  @IsOptional()
  @IsEnum(VerificationPlanStatus)
  status?: VerificationPlanStatus;

  @ApiProperty({ default: 0 })
  @IsOptional()
  @IsNumber()
  sort_order?: number;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  is_popular?: boolean;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  is_recommended?: boolean;
}