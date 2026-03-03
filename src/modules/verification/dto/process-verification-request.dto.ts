import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VerificationRequestStatus, RiskLevel } from '../entities/verification-request.entity';

export class ProcessVerificationRequestDto {
  @ApiProperty({ enum: VerificationRequestStatus })
  @IsEnum(VerificationRequestStatus)
  status: VerificationRequestStatus;

  @ApiProperty({ enum: RiskLevel, required: false })
  @IsOptional()
  @IsEnum(RiskLevel)
  risk_level?: RiskLevel;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  admin_notes?: string;
}