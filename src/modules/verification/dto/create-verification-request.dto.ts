import { IsString, IsOptional, IsEnum, IsNumber, IsArray, IsUUID, Min, IsEmail, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { RiskLevel } from '../entities/verification-request.entity';

export class DocumentResponseDto {
  @ApiProperty()
  @IsString()
  document_id: string;

  @ApiProperty()
  @IsString()
  label: string;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  value?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  file_url?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  file_name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  file_size?: number;
}

export class ProofFieldDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  label: string;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  value?: string;
}

export class CreateVerificationRequestDto {
  @ApiProperty()
  @IsUUID()
  plan_id: string;

  // Email verification
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  verification_email?: string;

  // Document responses
  @ApiProperty({ type: [DocumentResponseDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentResponseDto)
  document_responses?: DocumentResponseDto[];

  // Payment info
  @ApiProperty({ example: 500 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: 'bdt' })
  @IsString()
  currency: string;

  @ApiProperty({ example: 'Bank Transfer' })
  @IsString()
  payment_method: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  payment_method_type?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  payment_method_name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  transaction_id?: string;

  @ApiProperty({ type: [ProofFieldDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProofFieldDto)
  proof_fields?: ProofFieldDto[];

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  proof_images?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ enum: RiskLevel, default: RiskLevel.LOW })
  @IsOptional()
  @IsEnum(RiskLevel)
  risk_level?: RiskLevel;
}