import { IsEmail, IsString, MinLength, IsOptional, IsArray, IsIn, IsBoolean, IsUrl, IsPhoneNumber } from 'class-validator';

export class CreateAdminDto {
  @IsString()
  full_name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsIn(['Super Administrator', 'Administrator', 'Regular Administrator', 'Moderator', 'Editor'])
  admin_type?: string;

  @IsOptional()
  @IsArray()
  permissions?: string[];

  @IsOptional()  // ✅ এইটা থাকতেই হবে
  @IsString()
  status?: string;

  @IsOptional()  // ✅ এইটা থাকতেই হবে
  @IsString()  // যেকোনো দেশের ফোন নম্বর নিবে
  phone?: string;

  @IsOptional()  // ✅ এইটা থাকতেই হবে
  @IsString()
  department?: string;

  @IsOptional()  // ✅ এইটা থাকতেই হবে
  @IsString()
  avatar_url?: string;
}