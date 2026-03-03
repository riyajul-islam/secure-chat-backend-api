import { ApiProperty } from '@nestjs/swagger';

export class PageResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  show_in_footer: boolean;

  @ApiProperty()
  show_in_menu: boolean;

  @ApiProperty()
  author: string;

  @ApiProperty()
  views: number;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
