import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReportStatus, ReportAction } from '../enums/report.enum';

export class UpdateReportStatusDto {
  @ApiProperty({ enum: ReportStatus })
  @IsEnum(ReportStatus)
  status: ReportStatus;

  @ApiProperty({ enum: ReportAction, required: false })
  @IsOptional()
  @IsEnum(ReportAction)
  action_taken?: ReportAction;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  admin_notes?: string;
}
