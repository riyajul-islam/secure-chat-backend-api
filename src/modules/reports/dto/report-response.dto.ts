import { ApiProperty } from '@nestjs/swagger';
import { ReportType, ReportStatus, ReportAction } from '../enums/report.enum';

export class ReportResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  reporter_id: string;

  @ApiProperty()
  reporter_name: string;

  @ApiProperty()
  reported_id: string;

  @ApiProperty()
  reported_name: string;

  @ApiProperty({ enum: ReportType })
  type: ReportType;

  @ApiProperty()
  reason: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  evidence: string[];

  @ApiProperty({ enum: ReportStatus })
  status: ReportStatus;

  @ApiProperty({ enum: ReportAction })
  action_taken: ReportAction;

  @ApiProperty()
  admin_notes: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  processed_at: Date;
}
