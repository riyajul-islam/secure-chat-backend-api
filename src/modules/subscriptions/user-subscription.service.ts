import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { addDays, addMonths, addYears } from 'date-fns';
import { UserSubscription } from './entities/user-subscription.entity';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { SubscriptionStatus, BillingCycle } from './enums/subscription.enum';
import { UsersService } from '../users/users.service';

@Injectable()
export class UserSubscriptionService {
  constructor(
    @InjectRepository(UserSubscription)
    private userSubscriptionRepository: Repository<UserSubscription>,
    @InjectRepository(SubscriptionPlan)
    private planRepository: Repository<SubscriptionPlan>,
    private usersService: UsersService,
  ) {}

  async createSubscription(
    userId: string,
    planId: string,
    paymentDetails?: any,
  ): Promise<UserSubscription> {
    const user = await this.usersService.findById(userId);
    const plan = await this.planRepository.findOne({ where: { id: planId } });
    
    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    // Calculate end date based on billing cycle
    const startDate = new Date();
    let endDate: Date;

    switch (plan.billing_cycle) {
      case BillingCycle.MONTHLY:
        endDate = addMonths(startDate, 1);
        break;
      case BillingCycle.QUARTERLY:
        endDate = addMonths(startDate, 3);
        break;
      case BillingCycle.YEARLY:
        endDate = addYears(startDate, 1);
        break;
      default:
        endDate = addMonths(startDate, 1);
    }

    // Check if user has active subscription
    const activeSubscription = await this.getActiveSubscription(userId);
    if (activeSubscription) {
      throw new BadRequestException('User already has an active subscription');
    }

    const subscription = this.userSubscriptionRepository.create({
      user_id: userId,
      plan_id: planId,
      status: SubscriptionStatus.ACTIVE,
      start_date: startDate,
      end_date: endDate,
      auto_renew: true,
      paid_amount: plan.usd_price, // ← price → usd_price (USD price ব্যবহার করা হচ্ছে)
      payment_method: paymentDetails?.payment_method,
      payment_transaction_id: paymentDetails?.transaction_id,
      metadata: paymentDetails,
    });

    // Update user's subscription status
    await this.usersService.update(userId, { 
      subscription_status: SubscriptionStatus.ACTIVE 
    } as any);

    return this.userSubscriptionRepository.save(subscription);
  }

  async getActiveSubscription(userId: string): Promise<UserSubscription | null> {
    return this.userSubscriptionRepository.findOne({
      where: {
        user_id: userId,
        status: SubscriptionStatus.ACTIVE,
      },
      relations: ['plan'],
    });
  }

  async getUserSubscriptions(userId: string): Promise<UserSubscription[]> {
    return this.userSubscriptionRepository.find({
      where: { user_id: userId },
      relations: ['plan'],
      order: { created_at: 'DESC' },
    });
  }

  async cancelSubscription(id: string, userId: string): Promise<UserSubscription> {
    const subscription = await this.userSubscriptionRepository.findOne({
      where: { id, user_id: userId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    subscription.status = SubscriptionStatus.CANCELLED;
    subscription.auto_renew = false;

    // Update user's subscription status
    await this.usersService.update(userId, { 
      subscription_status: SubscriptionStatus.INACTIVE 
    } as any);

    return this.userSubscriptionRepository.save(subscription);
  }

  async renewSubscription(id: string): Promise<UserSubscription> {
    const subscription = await this.userSubscriptionRepository.findOne({
      where: { id },
      relations: ['plan'],
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (!subscription.auto_renew) {
      throw new BadRequestException('Auto-renew is disabled for this subscription');
    }

    // Calculate new end date
    const startDate = new Date();
    let endDate: Date;

    switch (subscription.plan.billing_cycle) {
      case BillingCycle.MONTHLY:
        endDate = addMonths(startDate, 1);
        break;
      case BillingCycle.QUARTERLY:
        endDate = addMonths(startDate, 3);
        break;
      case BillingCycle.YEARLY:
        endDate = addYears(startDate, 1);
        break;
      default:
        endDate = addMonths(startDate, 1);
    }

    subscription.start_date = startDate;
    subscription.end_date = endDate;
    subscription.status = SubscriptionStatus.ACTIVE;

    return this.userSubscriptionRepository.save(subscription);
  }

  async checkExpiredSubscriptions(): Promise<void> {
    const now = new Date();
    const expiredSubscriptions = await this.userSubscriptionRepository.find({
      where: {
        status: SubscriptionStatus.ACTIVE,
        end_date: now,
      },
    });

    for (const subscription of expiredSubscriptions) {
      subscription.status = SubscriptionStatus.EXPIRED;
      await this.userSubscriptionRepository.save(subscription);
      
      // Update user's subscription status
      await this.usersService.update(subscription.user_id, { 
        subscription_status: SubscriptionStatus.EXPIRED 
      } as any);
    }
  }
}
