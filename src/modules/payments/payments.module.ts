import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentMethod } from './entities/payment-method.entity';
import { FundRequest } from './entities/fund-request.entity';
import { Transaction } from './entities/transaction.entity';
import { PaymentMethodsService } from './payment-methods.service';
import { FundRequestsService } from './fund-requests.service';
import { TransactionsService } from './transactions.service';
import { PaymentMethodsController } from './payment-methods.controller';
import { FundRequestsController } from './fund-requests.controller';
import { UsersModule } from '../users/users.module';
import { AdminsModule } from '../admins/admins.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentMethod, FundRequest, Transaction]),
    UsersModule,
    AdminsModule,
  ],
  controllers: [PaymentMethodsController, FundRequestsController],
  providers: [PaymentMethodsService, FundRequestsService, TransactionsService],
  exports: [PaymentMethodsService, FundRequestsService, TransactionsService],
})
export class PaymentsModule {}
