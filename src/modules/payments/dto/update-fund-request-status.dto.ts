import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FundRequestStatus } from '../enums/payment.enum';

export class UpdateFundRequestStatusDto {
  @ApiProperty({ enum: FundRequestStatus, example: FundRequestStatus.APPROVED })
  @IsEnum(FundRequestStatus)
  status: FundRequestStatus;

  @ApiProperty({ description: 'Rejection reason (required if rejected)', required: false })
  @IsOptional()
  @IsString()
  rejection_reason?: string;
}
