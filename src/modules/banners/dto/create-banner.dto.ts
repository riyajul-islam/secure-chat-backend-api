import { IsString, IsOptional, IsNumber, IsIn, IsUrl, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBannerDto {
  @ApiProperty({ description: 'Banner title', example: 'Summer Sale Banner' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Banner image URL', example: 'https://res.cloudinary.com/.../banner.jpg' })
  @IsUrl()  // ← URL validation
  image_url: string;  // ← এই নামটা গুরুত্বপূর্ণ

  @ApiProperty({ description: 'Banner link (optional)', example: 'https://example.com/promotion', required: false })
  @IsOptional()
  @IsUrl()  // ← URL validation (optional)
  link?: string;

  @ApiProperty({ 
    description: 'Banner position', 
    enum: ['Dashboard Screen', 'Investment Screen', 'Funds Screen', 'News Screen', 'Transaction History Screen', 'Settings Screen', 'Security Settings Screen'],
    example: 'Dashboard Screen'
  })
  @IsString()
  @IsIn(['Dashboard Screen', 'Investment Screen', 'Funds Screen', 'News Screen', 'Transaction History Screen', 'Settings Screen', 'Security Settings Screen'])
  position: string;

  @ApiProperty({ description: 'Banner priority (lower number = higher priority)', default: 0, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priority?: number;

  @ApiProperty({ description: 'Banner status', enum: ['Active', 'Inactive'], default: 'Active' })
  @IsOptional()
  @IsIn(['Active', 'Inactive'])
  status?: string;
}