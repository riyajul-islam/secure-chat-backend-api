import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ParticipantStatus } from '../enums/tracking.enum';

export class ProcessInviteDto {
  @ApiProperty({ enum: ParticipantStatus, example: ParticipantStatus.ACCEPTED })
  @IsEnum(ParticipantStatus)
  status: ParticipantStatus.ACCEPTED | ParticipantStatus.REJECTED;
}
