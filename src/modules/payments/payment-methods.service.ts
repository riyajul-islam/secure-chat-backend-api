import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod } from './entities/payment-method.entity';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { PaymentMethodType, PaymentStatus } from './entities/payment-method.entity';

@Injectable()
export class PaymentMethodsService {
  constructor(
    @InjectRepository(PaymentMethod)
    private paymentMethodRepository: Repository<PaymentMethod>,
  ) {}

  async create(createDto: CreatePaymentMethodDto): Promise<PaymentMethod> {
    const method = this.paymentMethodRepository.create(createDto);
    return this.paymentMethodRepository.save(method);
  }

  async findAll(): Promise<PaymentMethod[]> {
    return this.paymentMethodRepository.find({
      order: { sort_order: 'ASC', created_at: 'DESC' }
    });
  }

  async findActive(): Promise<PaymentMethod[]> {
    return this.paymentMethodRepository.find({
      where: { status: PaymentStatus.ACTIVE },
      order: { sort_order: 'ASC', created_at: 'DESC' }
    });
  }

  async findOne(id: string): Promise<PaymentMethod> {
    const method = await this.paymentMethodRepository.findOne({ where: { id } });
    if (!method) {
      throw new NotFoundException(`Payment method with ID ${id} not found`);
    }
    return method;
  }

  async findByType(type: PaymentMethodType): Promise<PaymentMethod[]> {
    // Fix: type কে সঠিকভাবে কাস্ট করুন
    return this.paymentMethodRepository.find({
      where: { 
        type: type as any, // TypeORM-এর জন্য any হিসেবে কাস্ট
        status: PaymentStatus.ACTIVE 
      },
      order: { sort_order: 'ASC' }
    });
  }

  async update(id: string, updateDto: UpdatePaymentMethodDto): Promise<PaymentMethod> {
    const method = await this.findOne(id);
    Object.assign(method, updateDto);
    return this.paymentMethodRepository.save(method);
  }

  async remove(id: string): Promise<void> {
    const method = await this.findOne(id);
    await this.paymentMethodRepository.remove(method);
  }

  async toggleStatus(id: string): Promise<PaymentMethod> {
    const method = await this.findOne(id);
    method.status = method.status === PaymentStatus.ACTIVE 
      ? PaymentStatus.INACTIVE 
      : PaymentStatus.ACTIVE;
    return this.paymentMethodRepository.save(method);
  }
}