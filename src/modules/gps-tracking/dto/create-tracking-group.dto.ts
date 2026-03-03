import { IsString, IsOptional, IsNumber, IsBoolean, IsObject, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTrackingGroupDto {
  @ApiProperty({ example: 'Family Trip' })
  @IsString()
  name: string;

  @ApiProperty({ required: false, example: 'Weekend family trip tracking' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(1)
  max_participants: number;

  @ApiProperty({ example: 3600, description: 'Duration in seconds (1 hour = 3600)' })
  @IsNumber()
  @Min(300) // minimum 5 minutes
  duration: number;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  is_public?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  settings?: {
    show_history?: boolean;
    update_interval?: number;
    accuracy_threshold?: number;
  };
}
