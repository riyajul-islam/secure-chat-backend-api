import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { SubscriptionRequest } from '../subscriptions/entities/subscription-request.entity';
import { VerificationRequest } from '../verification/entities/verification-request.entity';
import { User } from '../users/entities/user.entity'; // User entity import
import { UserSubscription } from '../subscriptions/entities/user-subscription.entity'; // UserSubscription entity import

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SubscriptionRequest, 
      VerificationRequest,
      User,              // User repository যোগ করুন
      UserSubscription,  // UserSubscription repository যোগ করুন
    ]),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}