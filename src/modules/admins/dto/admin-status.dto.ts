import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PauseAdminDto {
  @ApiProperty({ description: 'Reason for pausing' })
  @IsString()
  reason: string;

  @ApiProperty({ description: 'Pause duration in days' })
  @IsNumber()
  @Min(1)
  @Max(365)
  duration: number;
}

export class BanAdminDto {
  @ApiProperty({ description: 'Reason for banning' })
  @IsString()
  reason: string;
}