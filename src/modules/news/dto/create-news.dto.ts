import { 
  IsString, IsOptional, IsArray, IsDateString, 
  IsBoolean, IsIn, IsUrl 
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNewsDto {
  @ApiProperty({ example: 'New Feature Released!' })
  @IsString()
  title: string;

  @ApiProperty({ 
    enum: ['News', 'Updates', 'Features', 'Maintenance', 'Announcements'],
    example: 'Updates'
  })
  @IsString()
  @IsIn(['News', 'Updates', 'Features', 'Maintenance', 'Announcements'])
  category: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiProperty({ example: '<h1>New Feature</h1><p>We are excited...</p>' })
  @IsString()
  content: string;

  @ApiProperty({ required: false, default: 'Admin' })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  image_url?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  published_date?: string;  // ← string হিসেবে রাখুন (ISO format)

  @ApiProperty({ enum: ['Draft', 'Published', 'Archived'], default: 'Draft' })
  @IsOptional()
  @IsIn(['Draft', 'Published', 'Archived'])
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}