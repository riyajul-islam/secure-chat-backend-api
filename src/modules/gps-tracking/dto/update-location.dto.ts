import { IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLocationDto {
  @ApiProperty({ example: 23.8103 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ example: 90.4125 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty({ required: false, example: 10.5 })
  @IsOptional()
  @IsNumber()
  accuracy?: number;

  @ApiProperty({ required: false, example: 15.2 })
  @IsOptional()
  @IsNumber()
  altitude?: number;

  @ApiProperty({ required: false, example: 5.5 })
  @IsOptional()
  @IsNumber()
  speed?: number;

  @ApiProperty({ required: false, example: 90 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(360)
  heading?: number;
}
