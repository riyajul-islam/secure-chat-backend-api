import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FundRequest } from './entities/fund-request.entity';
import { CreateFundRequestDto } from './dto/create-fund-request.dto';
import { UpdateFundRequestStatusDto } from './dto/update-fund-request-status.dto';
import { FundRequestStatus } from './enums/payment.enum';
import { UsersService } from '../users/users.service';
import { TransactionsService } from './transactions.service';
import { TransactionType } from './enums/payment.enum';


@Injectable()
export class FundRequestsService {
  constructor(
    @InjectRepository(FundRequest)
    private fundRequestRepository: Repository<FundRequest>,
    private usersService: UsersService,
    private transactionsService: TransactionsService,
  ) {}

  async create(userId: string, createDto: CreateFundRequestDto): Promise<FundRequest> {
    const user = await this.usersService.findById(userId);
    
    const request = this.fundRequestRepository.create({
      user_id: userId,
      ...createDto,
    });
    
    return this.fundRequestRepository.save(request);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: FundRequestStatus,
    userId?: string,
  ): Promise<{ data: FundRequest[]; total: number; page: number; limit: number }> {
    const where: any = {};
    
    if (status) where.status = status;
    if (userId) where.user_id = userId;

    const [data, total] = await this.fundRequestRepository.findAndCount({
      where,
      relations: ['user', 'approved_by'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<FundRequest> {
    const request = await this.fundRequestRepository.findOne({
      where: { id },
      relations: ['user', 'approved_by'],
    });
    
    if (!request) {
      throw new NotFoundException(`Fund request with ID ${id} not found`);
    }
    return request;
  }

  async updateStatus(
    id: string, 
    updateDto: UpdateFundRequestStatusDto, 
    adminId: string
  ): Promise<FundRequest> {
    const request = await this.findOne(id);
    
    if (request.status !== FundRequestStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be updated');
    }

    request.status = updateDto.status;
    request.approved_by_id = adminId;
    
    if (updateDto.rejection_reason) {
      request.rejection_reason = updateDto.rejection_reason;
    }

    // If approved, create transaction and update user balance
    if (updateDto.status === FundRequestStatus.APPROVED) {
      await this.transactionsService.create({
        user_id: request.user_id,
        type: TransactionType.DEPOSIT,
        amount: request.amount,
        description: `Fund request approved: ${request.id}`,
        payment_method: request.payment_method,
        reference: request.transaction_id,
      });

      // Update user balance
      const user = await this.usersService.findById(request.user_id);
      user.credit_balance = Number(user.credit_balance) + Number(request.amount);
      await this.usersService.update(user.id, { credit_balance: user.credit_balance });
    }

    return this.fundRequestRepository.save(request);
  }

  async getUserRequests(userId: string): Promise<FundRequest[]> {
    return this.fundRequestRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async getPendingCount(): Promise<number> {
    return this.fundRequestRepository.count({
      where: { status: FundRequestStatus.PENDING }
    });
  }
}
