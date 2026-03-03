import { IsString, IsOptional, IsEnum, IsObject, IsNumber, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethodType, PaymentCurrency, PaymentStatus, ApprovalType, DynamicField } from '../entities/payment-method.entity';

class FeeStructureDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  min_amount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  max_amount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fixed_fee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  percentage_fee?: number;
}

class DynamicFieldDto {
  @IsString()
  id: string;

  @IsString()
  type: 'text' | 'textarea' | 'number' | 'email' | 'date' | 'file' | 'select';

  @IsString()
  label: string;

  @IsOptional()
  @IsString()
  placeholder?: string;

  @IsOptional()
  required: boolean;

  @IsOptional()
  @IsArray()
  options?: string[];

  @IsOptional()
  @IsObject()
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export class CreatePaymentMethodDto {
  @ApiProperty({ description: 'Payment method name', example: 'Bank Transfer' })
  @IsString()
  name: string;

  @ApiProperty({ enum: PaymentMethodType, example: PaymentMethodType.BANK })
  @IsEnum(PaymentMethodType)
  type: PaymentMethodType;

  @ApiProperty({ enum: PaymentCurrency, example: PaymentCurrency.BOTH })
  @IsOptional()
  @IsEnum(PaymentCurrency)
  currency?: PaymentCurrency;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: PaymentStatus, default: PaymentStatus.ACTIVE })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiProperty({ enum: ApprovalType, default: ApprovalType.PENDING })
  @IsOptional()
  @IsEnum(ApprovalType)
  approval_type?: ApprovalType;

  @ApiProperty({ description: 'Sort order', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sort_order?: number;

  @ApiProperty({ description: 'Color theme', default: 'blue' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ description: 'Fee structure', required: false, type: FeeStructureDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => FeeStructureDto)
  fee_structure?: FeeStructureDto;

  @ApiProperty({ description: 'Dynamic proof fields', required: false, type: [DynamicFieldDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DynamicFieldDto)
  proof_fields?: DynamicFieldDto[];

  @ApiProperty({ description: 'Payment details', required: false, type: Object })
  @IsOptional()
  @IsObject()
  details?: Record<string, any>;

  @ApiProperty({ description: 'Instructions for users', required: false })
  @IsOptional()
  @IsString()
  instructions?: string;
}