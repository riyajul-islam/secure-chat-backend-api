import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';
import { CreateAdminDto } from './create-admin.dto';

export class UpdateAdminDto extends PartialType(CreateAdminDto) {
  // Only validate password if it's provided and not empty
  @ValidateIf(o => o.password !== undefined && o.password !== '')
  @IsString()
  @MinLength(6)
  password?: string;
}