import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerificationRequest, VerificationRequestStatus, RiskLevel } from './entities/verification-request.entity';
import { VerificationPlan } from './entities/verification-plan.entity';
import { CreateVerificationRequestDto } from './dto/create-verification-request.dto';
import { ProcessVerificationRequestDto } from './dto/process-verification-request.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class VerificationRequestsService {
  constructor(
    @InjectRepository(VerificationRequest)
    private requestRepository: Repository<VerificationRequest>,
    @InjectRepository(VerificationPlan)
    private planRepository: Repository<VerificationPlan>,
    private usersService: UsersService,
  ) {}

  async create(userId: string, createDto: CreateVerificationRequestDto): Promise<VerificationRequest> {
    console.log('Creating verification request with data:', JSON.stringify(createDto, null, 2));
    
    // Check if user already has pending request
    const pendingRequest = await this.requestRepository.findOne({
      where: {
        user_id: userId,
        status: VerificationRequestStatus.PENDING,
      },
    });

    if (pendingRequest) {
      throw new BadRequestException('You already have a pending verification request');
    }

    // Check if plan exists
    const plan = await this.planRepository.findOne({
      where: { id: createDto.plan_id },
    });

    if (!plan) {
      throw new NotFoundException('Verification plan not found');
    }

    // Ensure document_responses is properly formatted
    let documentResponses = createDto.document_responses;
    if (documentResponses && !Array.isArray(documentResponses)) {
      documentResponses = [];
    }

    // Ensure proof_fields is properly formatted
    let proofFields = createDto.proof_fields;
    if (proofFields && !Array.isArray(proofFields)) {
      proofFields = [];
    }

    const requestData: Partial<VerificationRequest> = {
      user_id: userId,
      plan_id: createDto.plan_id,
      amount: createDto.amount,
      currency: createDto.currency,
      payment_method: createDto.payment_method,
      payment_method_type: createDto.payment_method_type,
      payment_method_name: createDto.payment_method_name,
      transaction_id: createDto.transaction_id,
      verification_email: createDto.verification_email,
      document_responses: documentResponses || [],
      proof_fields: proofFields || [], // This will now be properly formatted
      proof_images: createDto.proof_images || [],
      notes: createDto.notes,
      risk_level: createDto.risk_level || RiskLevel.LOW,
    };

    console.log('Processed request data:', JSON.stringify(requestData, null, 2));

    const request = this.requestRepository.create(requestData);
    const savedRequest = await this.requestRepository.save(request);
    
    console.log('Saved request:', JSON.stringify(savedRequest, null, 2));
    
    return savedRequest;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: VerificationRequestStatus,
    userId?: string,
  ): Promise<{ data: VerificationRequest[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.requestRepository.createQueryBuilder('request')
      .leftJoinAndSelect('request.user', 'user')
      .leftJoinAndSelect('request.plan', 'plan')
      .leftJoinAndSelect('request.processed_by', 'processed_by')
      .orderBy('request.created_at', 'DESC');

    if (status) {
      queryBuilder.andWhere('request.status = :status', { status });
    }

    if (userId) {
      queryBuilder.andWhere('request.user_id = :userId', { userId });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<VerificationRequest> {
    const request = await this.requestRepository.findOne({
      where: { id },
      relations: ['user', 'plan', 'processed_by'],
    });

    if (!request) {
      throw new NotFoundException(`Verification request with ID ${id} not found`);
    }

    return request;
  }

  async getUserRequests(userId: string): Promise<VerificationRequest[]> {
    return this.requestRepository.find({
      where: { user_id: userId },
      relations: ['plan'],
      order: { created_at: 'DESC' },
    });
  }

  async processRequest(
    id: string,
    processDto: ProcessVerificationRequestDto,
    adminId: string,
  ): Promise<VerificationRequest> {
    const request = await this.findOne(id);

    if (request.status !== VerificationRequestStatus.PENDING && 
        request.status !== VerificationRequestStatus.AWAITING_EMAIL_VERIFICATION) {
      throw new BadRequestException('Only pending requests can be processed');
    }

    request.status = processDto.status;
    request.risk_level = processDto.risk_level || request.risk_level;
    request.admin_notes = processDto.admin_notes || '';
    request.processed_by_id = adminId;
    request.processed_at = new Date();

    // If approved, update user's verification status
    if (processDto.status === VerificationRequestStatus.APPROVED) {
      await this.usersService.update(request.user_id, {
        verified: true,
        verification_status: 'verified',
      } as any);
    }

    return await this.requestRepository.save(request);
  }

  async getPendingCount(): Promise<number> {
    return this.requestRepository.count({
      where: { status: VerificationRequestStatus.PENDING },
    });
  }

  async getStats(): Promise<any> {
    const total = await this.requestRepository.count();
    const pending = await this.requestRepository.count({ where: { status: VerificationRequestStatus.PENDING } });
    const approved = await this.requestRepository.count({ where: { status: VerificationRequestStatus.APPROVED } });
    const rejected = await this.requestRepository.count({ where: { status: VerificationRequestStatus.REJECTED } });
    const escalated = await this.requestRepository.count({ where: { status: VerificationRequestStatus.ESCALATED } });
    const awaitingEmail = await this.requestRepository.count({ 
      where: { status: VerificationRequestStatus.AWAITING_EMAIL_VERIFICATION } 
    });

    return { total, pending, approved, rejected, escalated, awaitingEmail };
  }
}