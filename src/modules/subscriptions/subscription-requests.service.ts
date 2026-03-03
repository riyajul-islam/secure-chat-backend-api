import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionRequest } from './entities/subscription-request.entity';
import { CreateSubscriptionRequestDto } from './dto/create-subscription-request.dto';
import { ProcessSubscriptionRequestDto } from './dto/process-subscription-request.dto';
import { SubscriptionRequestStatus } from './enums/subscription.enum';
import { UserSubscriptionService } from './user-subscription.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class SubscriptionRequestsService {
  constructor(
    @InjectRepository(SubscriptionRequest)
    private requestRepository: Repository<SubscriptionRequest>,
    private userSubscriptionService: UserSubscriptionService,
    private usersService: UsersService,
  ) {}

  async create(userId: string, createDto: CreateSubscriptionRequestDto): Promise<SubscriptionRequest> {
  // Check if user already has pending request
  const pendingRequest = await this.requestRepository.findOne({
    where: {
      user_id: userId,
      status: SubscriptionRequestStatus.PENDING,
    },
  });

  if (pendingRequest) {
    throw new BadRequestException('You already have a pending subscription request');
  }

  // Ensure proof_fields is properly formatted
  let proofFields = createDto.proof_fields;
  if (proofFields && !Array.isArray(proofFields)) {
    proofFields = [];
  }

  const request = this.requestRepository.create({
    user_id: userId,
    ...createDto,
    proof_fields: proofFields, // Store as is - TypeORM will handle JSON conversion
  });

  return this.requestRepository.save(request);
}

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: SubscriptionRequestStatus,
  ): Promise<{ data: SubscriptionRequest[]; total: number; page: number; limit: number }> {
    const where: any = {};
    if (status) where.status = status;

    const [data, total] = await this.requestRepository.findAndCount({
      where,
      relations: ['user', 'plan', 'processed_by'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<SubscriptionRequest> {
    const request = await this.requestRepository.findOne({
      where: { id },
      relations: ['user', 'plan', 'processed_by'],
    });

    if (!request) {
      throw new NotFoundException(`Subscription request with ID ${id} not found`);
    }

    return request;
  }

  async getUserRequests(userId: string): Promise<SubscriptionRequest[]> {
    return this.requestRepository.find({
      where: { user_id: userId },
      relations: ['plan'],
      order: { created_at: 'DESC' },
    });
  }

  async processRequest(
    id: string,
    processDto: ProcessSubscriptionRequestDto,
    adminId: string,
  ): Promise<SubscriptionRequest> {
    const request = await this.findOne(id);

    if (request.status !== SubscriptionRequestStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be processed');
    }

    request.status = processDto.status;
    request.admin_notes = processDto.admin_notes || '';
    request.processed_by_id = adminId;
    request.processed_at = new Date();

    // If approved, create actual subscription
    if (processDto.status === SubscriptionRequestStatus.APPROVED) {
      await this.userSubscriptionService.createSubscription(
        request.user_id,
        request.plan_id,
        {
          payment_method: request.payment_method,
          transaction_id: request.transaction_id,
        },
      );
    }

    return this.requestRepository.save(request);
  }

  async getPendingCount(): Promise<number> {
    return this.requestRepository.count({
      where: { status: SubscriptionRequestStatus.PENDING },
    });
  }
}
