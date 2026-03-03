import { IsEnum, IsString, IsOptional, IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReportType } from '../enums/report.enum';

export class CreateReportDto {
  @ApiProperty({ description: 'ID of the user being reported' })
  @IsUUID()
  reported_user_id: string;

  @ApiProperty({ enum: ReportType, description: 'Type of report' })
  @IsEnum(ReportType)
  type: ReportType;

  @ApiProperty({ description: 'Short reason for report' })
  @IsString()
  reason: string;

  @ApiProperty({ required: false, description: 'Detailed description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, description: 'Evidence URLs (screenshots etc)' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  evidence?: string[];
}
