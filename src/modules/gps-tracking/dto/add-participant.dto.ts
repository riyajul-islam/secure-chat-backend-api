import { IsUUID, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddParticipantDto {
  @ApiProperty({ example: 'user-id-here' })
  @IsUUID()
  user_id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  message?: string;
}
