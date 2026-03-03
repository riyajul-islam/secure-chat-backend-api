import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { PlanType, BillingCycle, UserLimitType, TrackingPermission } from './enums/subscription.enum';

@Injectable()
export class SubscriptionPlansService {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private planRepository: Repository<SubscriptionPlan>,
  ) {}

  async create(createDto: CreatePlanDto): Promise<SubscriptionPlan> {
    const plan = this.planRepository.create({
      ...createDto,
      is_active: true,
    });
    return this.planRepository.save(plan);
  }

  async findAll(activeOnly: boolean = false): Promise<SubscriptionPlan[]> {
  const where = activeOnly ? { is_active: true } : {};
  return this.planRepository.find({
    where,
    order: { created_at: 'DESC' }, // ← সর্বশেষ তৈরি আগে দেখাবে
  });
}

  async findOne(id: string): Promise<SubscriptionPlan> {
    const plan = await this.planRepository.findOne({ where: { id } });
    if (!plan) {
      throw new NotFoundException(`Subscription plan with ID ${id} not found`);
    }
    return plan;
  }

  async update(id: string, updateDto: UpdatePlanDto): Promise<SubscriptionPlan> {
    const plan = await this.findOne(id);
    Object.assign(plan, updateDto);
    return this.planRepository.save(plan);
  }

  async remove(id: string): Promise<void> {
    const plan = await this.findOne(id);
    await this.planRepository.remove(plan);
  }

  async toggleStatus(id: string): Promise<SubscriptionPlan> {
    const plan = await this.findOne(id);
    plan.is_active = !plan.is_active;
    return this.planRepository.save(plan);
  }

  async getDefaultPlans(): Promise<SubscriptionPlan[]> {
  // Create default plans if none exist
  const count = await this.planRepository.count();
  if (count === 0) {
    const defaultPlans = [
      {
        name: 'Starter',
        type: PlanType.STARTER,
        credits: 100,
        usd_price: 3.59,  // 299 BDT ≈ 3.59 USD
        bdt_price: 299,
        billing_cycle: BillingCycle.MONTHLY,
        description: 'Basic 1:1 chat & calls',
        features: ['1:1 Chat', '1:1 Audio/Video Calls'],
        user_limit_type: UserLimitType.ONE,
        can_group_call: false,
        max_groups: 0,
        max_group_members: 0,
        has_gps_tracking: false,
        gps_tracking_permission: TrackingPermission.CANNOT_TRACK,
        high_security: true,
        unlimited_message: true,
        unlimited_attachments: true,
        unlimited_storage: true,
        unlimited_calls: true,
      },
      {
        name: 'Growth',
        type: PlanType.GROWTH,
        credits: 200,
        usd_price: 5.99,  // 499 BDT ≈ 5.99 USD
        bdt_price: 499,
        billing_cycle: BillingCycle.MONTHLY,
        description: 'Small group access',
        features: ['Up to 5 group members', 'Group Audio Calls'],
        user_limit_type: UserLimitType.FIVE,
        can_group_call: true,
        max_groups: 10,
        max_group_members: 5,
        has_gps_tracking: false,
        gps_tracking_permission: TrackingPermission.CANNOT_TRACK,
        high_security: true,
        unlimited_message: true,
        unlimited_attachments: true,
        unlimited_storage: true,
        unlimited_calls: true,
      },
      {
        name: 'Professional',
        type: PlanType.PROFESSIONAL,
        credits: 500,
        usd_price: 11.99, // 999 BDT ≈ 11.99 USD
        bdt_price: 999,
        billing_cycle: BillingCycle.MONTHLY,
        description: 'Full features with GPS tracking',
        features: ['Up to 10 group members', 'Group Video Calls', 'Location Sharing', 'GPS Tracking'],
        user_limit_type: UserLimitType.TEN,
        can_group_call: true,
        max_groups: 50,
        max_group_members: 10,
        has_gps_tracking: true,
        gps_tracking_permission: TrackingPermission.CAN_TRACK,
        max_tracking_groups: 3,
        max_tracked_users_per_group: 10,
        high_security: true,
        unlimited_message: true,
        unlimited_attachments: true,
        unlimited_storage: true,
        unlimited_calls: true,
      },
      {
        name: 'Business',
        type: PlanType.BUSINESS,
        credits: 1000,
        usd_price: 23.99, // 1999 BDT ≈ 23.99 USD
        bdt_price: 1999,
        billing_cycle: BillingCycle.MONTHLY,
        description: 'Business solution with advanced tracking',
        features: ['Up to 20 group members', 'Priority Support', 'Advanced GPS Tracking', 'Analytics'],
        user_limit_type: UserLimitType.TWENTY,
        can_group_call: true,
        max_groups: 200,
        max_group_members: 20,
        has_gps_tracking: true,
        gps_tracking_permission: TrackingPermission.CAN_TRACK,
        max_tracking_groups: 10,
        max_tracked_users_per_group: 20,
        high_security: true,
        unlimited_message: true,
        unlimited_attachments: true,
        unlimited_storage: true,
        unlimited_calls: true,
      },
    ];
    
    for (const planData of defaultPlans) {
      const plan = this.planRepository.create(planData as Partial<SubscriptionPlan>);
      await this.planRepository.save(plan);
    }
  }
  return this.findAll(true);
}
}