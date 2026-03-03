import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionRequestStatus } from '../enums/subscription.enum';

export class ProcessSubscriptionRequestDto {
  @ApiProperty({ enum: SubscriptionRequestStatus })
  @IsEnum(SubscriptionRequestStatus)
  status: SubscriptionRequestStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  admin_notes?: string;
}