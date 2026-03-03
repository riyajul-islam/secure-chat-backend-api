import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { UserSubscription } from './entities/user-subscription.entity';
import { SubscriptionRequest } from './entities/subscription-request.entity';
import { SubscriptionPlansService } from './subscription-plans.service';
import { UserSubscriptionService } from './user-subscription.service';
import { SubscriptionRequestsService } from './subscription-requests.service';
import { SubscriptionPlansController } from './subscription-plans.controller';
import { SubscriptionRequestsController } from './subscription-requests.controller';
import { UserSubscriptionController } from './user-subscription.controller';
import { UsersModule } from '../users/users.module';
import { AdminsModule } from '../admins/admins.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubscriptionPlan, UserSubscription, SubscriptionRequest]),
    UsersModule,
    AdminsModule,
  ],
  controllers: [
    SubscriptionPlansController,
    SubscriptionRequestsController,
    UserSubscriptionController,
  ],
  providers: [
    SubscriptionPlansService,
    UserSubscriptionService,
    SubscriptionRequestsService,
  ],
  exports: [
    SubscriptionPlansService,
    UserSubscriptionService,
    SubscriptionRequestsService,
  ],
})
export class SubscriptionsModule {}
