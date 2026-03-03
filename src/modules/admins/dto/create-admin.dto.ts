import { IsEmail, IsString, MinLength, IsOptional, IsArray, IsIn } from 'class-validator';

export class CreateAdminDto {
  @IsString()
  full_name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsIn(['Super Administrator', 'Administrator', 'Regular Administrator'])
  admin_type?: string;

  @IsOptional()
  @IsArray()
  permissions?: string[];
}
