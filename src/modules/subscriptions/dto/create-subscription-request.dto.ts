import { IsString, IsNumber, IsOptional, IsArray, IsEnum, IsObject, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

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

export class CreateSubscriptionRequestDto {
  @ApiProperty()
  @IsString()
  plan_id: string;

  @ApiProperty({ example: 999 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: 'bKash Mobile' })
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
  approval_type?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  payment_currency?: string;

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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  proof_images?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}