import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { generateUserId } from './utils/user-id-generator';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(page: number = 1, limit: number = 25): Promise<{ data: User[]; total: number; page: number; limit: number }> {
  const [data, total] = await this.userRepository.findAndCount({
    order: { created_at: 'DESC' },
    skip: (page - 1) * limit,
    take: limit,
  });

  // প্রতিটি ইউজারের জন্য join_date থেকে days_since_join ক্যালকুলেট করুন
  const now = new Date();
  const transformedData = data.map(user => {
    const joinDate = new Date(user.join_date);
    const diffTime = Math.abs(now.getTime() - joinDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      ...user,
      days_since_join: diffDays, // কত দিন হল জয়েন করেছে
      serial_no: null, // সার্ভার থেকে serial no পাঠাবেন না
    };
  });

  return { 
    data: transformedData, 
    total, 
    page, 
    limit 
  };
}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
        where: { id }
        });
        if (!user) {
          throw new NotFoundException(`User with ID ${id} not found`);
        }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    // Generate user_id (format: 8 + 5 digits = 6 digits total)
    const manualPart = createUserDto.manual_user_id || '00000';
    const cleanManual = manualPart.replace(/[^0-9]/g, '').slice(0, 5).padStart(5, '0');
    const userId = `8${cleanManual}`; // 8 + 12345 = 812345
    
    const user = this.userRepository.create({
      name: createUserDto.name,
      username: createUserDto.username,
      email: createUserDto.email,
      phone: createUserDto.phone,
      user_id: userId,
      password_hash: hashedPassword,
      status: createUserDto.status || 'offline', // ✅ এখন error হবে না
      country: createUserDto.country,
      age: createUserDto.age,
      join_date: new Date(),
    });
    
    return this.userRepository.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
  const user = await this.findById(id);
  
  // Check if password exists in updateUserDto
  if ('password' in updateUserDto && updateUserDto.password) {
    const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
    const { password, ...restDto } = updateUserDto;
    Object.assign(user, restDto, { password_hash: hashedPassword });
  } else {
    // Handle verification fields separately with null checks
    if (updateUserDto.verified !== undefined) {
      user.verified = updateUserDto.verified;
    }
    if (updateUserDto.verification_status !== undefined) {
      user.verification_status = updateUserDto.verification_status;
    }
    // Handle credit balance
    if (updateUserDto.credit_balance !== undefined) {
      user.credit_balance = updateUserDto.credit_balance;
    }
    // Assign other fields
    Object.assign(user, updateUserDto);
  }
  
  return this.userRepository.save(user);
}

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.userRepository.remove(user);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.update(id, { last_login: new Date() });
  }
}
