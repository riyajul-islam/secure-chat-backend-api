import { IsString, IsNumber, IsOptional, IsArray, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFundRequestDto {
  @ApiProperty({ description: 'Amount to add', example: 1000 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ description: 'Payment method', example: 'Bank Transfer' })
  @IsString()
  payment_method: string;

  @ApiProperty({ description: 'Transaction ID', example: 'TXN123456', required: false })
  @IsOptional()
  @IsString()
  transaction_id?: string;

  @ApiProperty({ description: 'Proof images URLs', required: false })
  @IsOptional()
  @IsArray()
  proof_images?: string[];

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
