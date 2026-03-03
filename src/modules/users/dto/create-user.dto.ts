import { IsEmail, IsString, MinLength, IsOptional, IsNumber, IsBoolean, IsIn, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'johndoe' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '01712345678', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ 
    example: 'Pass@123', 
    description: 'Minimum 6 characters, must contain at least one uppercase, one lowercase, one number and one special character' 
  })
  @IsString()
  @MinLength(6)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
    {
      message: 'Password must contain at least one uppercase, one lowercase, one number and one special character',
    }
  )
  password: string;

  @ApiProperty({ example: 'Bangladesh', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ example: 25, required: false })
  @IsOptional()
  @IsNumber()
  age?: number;
  
  @ApiProperty({ example: '12345', required: false, description: 'Last 5 digits of User ID' })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{5}$/, { message: 'Manual part must be exactly 5 digits' })
  manual_user_id?: string;

  @ApiProperty({ 
    enum: ['online', 'offline', 'away', 'busy'], 
    default: 'offline',
    required: false 
  })
  @IsOptional()
  @IsIn(['online', 'offline', 'away', 'busy'])
  status?: string;

  // These fields are for updates only, not for creation
  @IsOptional()
  @IsBoolean()
  verified?: boolean;

  @IsOptional()
  @IsString()
  verification_status?: string;
}