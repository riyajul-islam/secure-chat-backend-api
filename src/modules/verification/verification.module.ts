import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationPlansService } from './verification-plans.service';
import { VerificationRequestsService } from './verification-requests.service';
import { VerificationEmailService } from './verification-email.service';
import { VerificationPlansController } from './verification-plans.controller';
import { VerificationRequestsController } from './verification-requests.controller';
import { VerificationPlan } from './entities/verification-plan.entity';
import { VerificationRequest } from './entities/verification-request.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VerificationPlan, VerificationRequest]),
    UsersModule,
  ],
  controllers: [VerificationPlansController, VerificationRequestsController],
  providers: [VerificationPlansService, VerificationRequestsService, VerificationEmailService],
  exports: [VerificationPlansService, VerificationRequestsService, VerificationEmailService],
})
export class VerificationModule {}