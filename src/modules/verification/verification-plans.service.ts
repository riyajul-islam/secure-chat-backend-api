import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerificationPlan, VerificationPlanStatus } from './entities/verification-plan.entity';
import { CreateVerificationPlanDto } from './dto/create-verification-plan.dto';
import { UpdateVerificationPlanDto } from './dto/update-verification-plan.dto';

@Injectable()
export class VerificationPlansService {
  constructor(
    @InjectRepository(VerificationPlan)
    private planRepository: Repository<VerificationPlan>,
  ) { }

  async create(createDto: CreateVerificationPlanDto, adminId: string): Promise<VerificationPlan> {
  const planData: Partial<VerificationPlan> = {
    name: createDto.name,
    description: createDto.description,
    credits: createDto.credits,
    usd_price: createDto.usd_price,
    bdt_price: createDto.bdt_price,
    time_unit: createDto.time_unit,
    time_value: createDto.time_value,
    custom_time_value: createDto.custom_time_value || null,
    custom_time_unit: createDto.custom_time_unit || null,
    is_offer: createDto.is_offer || false,
    offer_start_date: createDto.is_offer && createDto.offer_start_date ? new Date(createDto.offer_start_date) : null,
    offer_end_date: createDto.is_offer && createDto.offer_end_date ? new Date(createDto.offer_end_date) : null,
    offer_discount_percentage: createDto.offer_discount_percentage || null,
    offer_badge_text: createDto.offer_badge_text || null,
    require_email_verification: createDto.require_email_verification || false,
    required_documents: createDto.required_documents || [],
    status: createDto.status || VerificationPlanStatus.ACTIVE,
    sort_order: createDto.sort_order || 0,
    features: createDto.features || [],
    is_popular: createDto.is_popular || false,
    is_recommended: createDto.is_recommended || false,
    created_by_id: adminId,
    updated_by_id: adminId,
  };

  const plan = this.planRepository.create(planData);
  return await this.planRepository.save(plan);
}

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: VerificationPlanStatus,
    search?: string,
  ): Promise<{ data: VerificationPlan[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.planRepository.createQueryBuilder('plan')
      .leftJoinAndSelect('plan.created_by', 'created_by')
      .leftJoinAndSelect('plan.updated_by', 'updated_by')
      .orderBy('plan.sort_order', 'ASC')
      .addOrderBy('plan.created_at', 'DESC');

    if (status) {
      queryBuilder.andWhere('plan.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(plan.name ILIKE :search OR plan.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<VerificationPlan> {
    const plan = await this.planRepository.findOne({
      where: { id },
      relations: ['created_by', 'updated_by'],
    });

    if (!plan) {
      throw new NotFoundException(`Verification plan with ID ${id} not found`);
    }

    return plan;
  }

  async update(id: string, updateDto: UpdateVerificationPlanDto, adminId: string): Promise<VerificationPlan> {
    const plan = await this.findOne(id);

    // Update fields
    if (updateDto.name !== undefined) plan.name = updateDto.name;
    if (updateDto.description !== undefined) plan.description = updateDto.description;
    if (updateDto.credits !== undefined) plan.credits = updateDto.credits;
    if (updateDto.usd_price !== undefined) plan.usd_price = updateDto.usd_price;
    if (updateDto.bdt_price !== undefined) plan.bdt_price = updateDto.bdt_price;
    if (updateDto.time_unit !== undefined) plan.time_unit = updateDto.time_unit;
    if (updateDto.time_value !== undefined) plan.time_value = updateDto.time_value;
    if (updateDto.custom_time_value !== undefined) plan.custom_time_value = updateDto.custom_time_value || null;
    if (updateDto.custom_time_unit !== undefined) plan.custom_time_unit = updateDto.custom_time_unit || null;
    if (updateDto.is_offer !== undefined) plan.is_offer = updateDto.is_offer;
    
    // Handle offer dates conditionally
    if (updateDto.is_offer === true) {
      if (updateDto.offer_start_date !== undefined) {
        plan.offer_start_date = updateDto.offer_start_date ? new Date(updateDto.offer_start_date) : null;
      }
      if (updateDto.offer_end_date !== undefined) {
        plan.offer_end_date = updateDto.offer_end_date ? new Date(updateDto.offer_end_date) : null;
      }
    } else if (updateDto.is_offer === false) {
      // If offer is turned off, clear the dates
      plan.offer_start_date = null;
      plan.offer_end_date = null;
    } else {
      // Keep existing values
    }
    
    if (updateDto.offer_discount_percentage !== undefined) plan.offer_discount_percentage = updateDto.offer_discount_percentage || null;
    if (updateDto.offer_badge_text !== undefined) plan.offer_badge_text = updateDto.offer_badge_text || null;
    if (updateDto.require_email_verification !== undefined) plan.require_email_verification = updateDto.require_email_verification;
    if (updateDto.required_documents !== undefined) plan.required_documents = updateDto.required_documents || [];
    if (updateDto.status !== undefined) plan.status = updateDto.status;
    if (updateDto.sort_order !== undefined) plan.sort_order = updateDto.sort_order;
    if (updateDto.features !== undefined) plan.features = updateDto.features || [];
    if (updateDto.is_popular !== undefined) plan.is_popular = updateDto.is_popular;
    if (updateDto.is_recommended !== undefined) plan.is_recommended = updateDto.is_recommended;

    plan.updated_by_id = adminId;

    return await this.planRepository.save(plan);
  }

  async remove(id: string): Promise<void> {
    const plan = await this.findOne(id);
    await this.planRepository.remove(plan);
  }

  async toggleStatus(id: string, adminId: string): Promise<VerificationPlan> {
    const plan = await this.findOne(id);
    plan.status = plan.status === VerificationPlanStatus.ACTIVE
      ? VerificationPlanStatus.INACTIVE
      : VerificationPlanStatus.ACTIVE;
    plan.updated_by_id = adminId;
    return await this.planRepository.save(plan);
  }

  async getActivePlans(): Promise<VerificationPlan[]> {
    return this.planRepository.find({
      where: { status: VerificationPlanStatus.ACTIVE },
      order: { sort_order: 'ASC', created_at: 'DESC' },
    });
  }
}