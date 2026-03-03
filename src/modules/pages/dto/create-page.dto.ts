import { IsString, IsOptional, IsBoolean, IsIn, IsUrl, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePageDto {
  @ApiProperty({ description: 'Page title', example: 'About Us' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Page slug (URL)', example: 'about-us' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug can only contain lowercase letters, numbers, and hyphens' })
  slug: string;

  @ApiProperty({ 
    description: 'Page type', 
    enum: ['About Us', 'Privacy Policy', 'Terms of Service', 'FAQ', 'Rules', 'Payment Guide', 'Contact Us', 'Custom'],
    example: 'About Us'
  })
  @IsString()
  @IsIn(['About Us', 'Privacy Policy', 'Terms of Service', 'FAQ', 'Rules', 'Payment Guide', 'Contact Us', 'Custom'])
  type: string;

  @ApiProperty({ description: 'Page content', example: '<h1>About Our Company</h1><p>We are...</p>' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'Page status', enum: ['Draft', 'Published'], default: 'Draft' })
  @IsOptional()
  @IsIn(['Draft', 'Published'])
  status?: string;

  @ApiProperty({ description: 'Show in footer menu', default: false })
  @IsOptional()
  @IsBoolean()
  show_in_footer?: boolean;

  @ApiProperty({ description: 'Show in main menu', default: false })
  @IsOptional()
  @IsBoolean()
  show_in_menu?: boolean;

  @ApiProperty({ description: 'Author name', default: 'Admin' })
  @IsOptional()
  @IsString()
  author?: string;
}
