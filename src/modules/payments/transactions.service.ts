import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionType, TransactionStatus } from './enums/payment.enum';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async create(createDto: CreateTransactionDto): Promise<Transaction> {
    const transaction = this.transactionRepository.create(createDto);
    return this.transactionRepository.save(transaction);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    userId?: string,
    type?: TransactionType,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{ data: Transaction[]; total: number; page: number; limit: number }> {
    const where: any = {};
    
    if (userId) where.user_id = userId;
    if (type) where.type = type;
    if (startDate && endDate) {
      where.created_at = Between(startDate, endDate);
    }

    const [data, total] = await this.transactionRepository.findAndCount({
      where,
      relations: ['user'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    return transaction;
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async getBalance(userId: string): Promise<number> {
    const deposits = await this.transactionRepository.sum('amount', {
      user_id: userId,
      type: TransactionType.DEPOSIT,
      status: TransactionStatus.COMPLETED,
    });

    const withdrawals = await this.transactionRepository.sum('amount', {
      user_id: userId,
      type: TransactionType.WITHDRAWAL,
      status: TransactionStatus.COMPLETED,
    });

    return (deposits || 0) - (withdrawals || 0);
  }

  async getStats(startDate?: Date, endDate?: Date): Promise<any> {
    const where: any = {};
    if (startDate && endDate) {
      where.created_at = Between(startDate, endDate);
    }

    const totalDeposits = await this.transactionRepository.sum('amount', {
      ...where,
      type: TransactionType.DEPOSIT,
      status: TransactionStatus.COMPLETED,
    });

    const totalWithdrawals = await this.transactionRepository.sum('amount', {
      ...where,
      type: TransactionType.WITHDRAWAL,
      status: TransactionStatus.COMPLETED,
    });

    const totalFees = await this.transactionRepository.sum('amount', {
      ...where,
      type: TransactionType.FEE,
      status: TransactionStatus.COMPLETED,
    });

    const transactionCount = await this.transactionRepository.count(where);

    return {
      totalDeposits: totalDeposits || 0,
      totalWithdrawals: totalWithdrawals || 0,
      totalFees: totalFees || 0,
      netRevenue: (totalDeposits || 0) - (totalWithdrawals || 0),
      transactionCount,
    };
  }
}
