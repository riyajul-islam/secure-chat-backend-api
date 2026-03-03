import { ApiProperty } from '@nestjs/swagger';

export class NewsResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  category: string;

  @ApiProperty()
  excerpt: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  author: string;

  @ApiProperty()
  image_url: string;

  @ApiProperty()
  published_date: Date;

  @ApiProperty()
  status: string;

  @ApiProperty()
  views: number;

  @ApiProperty()
  tags: string[];

  @ApiProperty()
  featured: boolean;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
