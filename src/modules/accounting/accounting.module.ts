import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountingService } from './accounting.service';
import { AccountingController } from './accounting.controller';
import { SubscriptionRequest } from '../subscriptions/entities/subscription-request.entity';
import { VerificationRequest } from '../verification/entities/verification-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubscriptionRequest, VerificationRequest]),
  ],
  controllers: [AccountingController],
  providers: [AccountingService],
  exports: [AccountingService],
})
export class AccountingModule {}