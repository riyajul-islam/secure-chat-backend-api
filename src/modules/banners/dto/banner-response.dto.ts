import { ApiProperty } from '@nestjs/swagger';

export class BannerResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  image_url: string;

  @ApiProperty()
  link: string;

  @ApiProperty()
  position: string;

  @ApiProperty()
  priority: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
