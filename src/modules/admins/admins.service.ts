import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './entities/admin.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminLoginHistory } from './entities/admin-login-history.entity';
import { Between, LessThan, MoreThan, IsNull } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(AdminLoginHistory)
    private loginHistoryRepository: Repository<AdminLoginHistory>,
  ) {}

  async findAll(): Promise<Admin[]> {
    return this.adminRepository.find();
  }

  async findById(id: string): Promise<Admin> {
    const admin = await this.adminRepository.findOne({ where: { id } });
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    return admin;
  }

  async findByEmail(email: string): Promise<Admin | null> {
    return this.adminRepository.findOne({ where: { email } });
  }

  async create(createAdminDto: CreateAdminDto): Promise<Admin> {
    const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);
    const admin = this.adminRepository.create({
      ...createAdminDto,
      password_hash: hashedPassword,
    });
    return this.adminRepository.save(admin);
  }

  async update(id: string, updateAdminDto: UpdateAdminDto): Promise<Admin> {
    const admin = await this.findById(id);
    
    if (updateAdminDto.password) {
      updateAdminDto['password_hash'] = await bcrypt.hash(updateAdminDto.password, 10);
      delete updateAdminDto.password;
    }
    
    Object.assign(admin, updateAdminDto);
    return this.adminRepository.save(admin);
  }

  async remove(id: string): Promise<void> {
    const admin = await this.findById(id);
    await this.adminRepository.remove(admin);
  }


  async terminateSession(adminId: string, sessionId: string, currentAdmin: Admin): Promise<void> {
  // Check permissions
    if (adminId !== currentAdmin.id && currentAdmin.admin_type !== 'Super Administrator') {
      throw new ForbiddenException('You can only terminate your own sessions');
    }

    await this.loginHistoryRepository.update(
      { id: sessionId },
      { logout_at: new Date() }
    );
  }

  // ---------- Login History ----------

  // AuthService-এ login করার সময় এই মেথড কল করুন
  async recordLogin(adminId: string, req: any, status: string = 'success', reason?: string): Promise<AdminLoginHistory> {
    const history = this.loginHistoryRepository.create({
      admin_id: adminId,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      status,
      failure_reason: reason,
    });
    return this.loginHistoryRepository.save(history);
  }

  async recordLogout(adminId: string): Promise<void> {


    // Update login history - TypeORM-এ null assign করার সঠিক পদ্ধতি
    await this.loginHistoryRepository
      .createQueryBuilder()
      .update()
      .set({ logout_at: new Date() })
      .where("admin_id = :adminId AND logout_at IS NULL", { adminId })
      .execute();
  }

  async getLoginHistory(adminId: string, days: number = 15): Promise<AdminLoginHistory[]> {
    const date = new Date();
    date.setDate(date.getDate() - days);

    return this.loginHistoryRepository.find({
      where: {
        admin_id: adminId,
        login_at: MoreThan(date),
      },
      order: { login_at: 'DESC' },
    });
  }

  async updateLastLogout(adminId: string): Promise<void> {
    // Admin-এর last_logout field আপডেট করুন
    await this.adminRepository.update(
      { id: adminId },
      { last_logout: new Date() }
    );

    // সর্বশেষ login history-র logout_at আপডেট করুন
    await this.loginHistoryRepository.update(
      { 
        admin_id: adminId,
        logout_at: IsNull()
      },
      { logout_at: new Date() }
    );
  }

  // ---------- Admin Status Management ----------
  async pauseAdmin(id: string, reason: string, duration: number, currentAdmin: Admin): Promise<Admin> {
    const admin = await this.findById(id);

    if (id === currentAdmin.id) {
      throw new Error('You cannot pause your own account');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + duration);

    admin.status = 'Paused';
    admin.is_locked = true;
    admin.lock_reason = reason;
    admin.lock_expires_at = expiresAt;
    admin.locked_by = currentAdmin.id;

    const updatedAdmin = await this.adminRepository.save(admin);

    return updatedAdmin;
  }

  async banAdmin(id: string, reason: string, currentAdmin: Admin): Promise<Admin> {
    const admin = await this.findById(id);

    if (id === currentAdmin.id) {
      throw new Error('You cannot ban your own account');
    }

    admin.status = 'Banned';
    admin.is_locked = true;
    admin.lock_reason = reason;
    admin.lock_expires_at = null as any;  // Permanent ban
    admin.locked_by = currentAdmin.id;

    const updatedAdmin = await this.adminRepository.save(admin);

    return updatedAdmin;
  }

  async unbanAdmin(id: string, currentAdmin: Admin): Promise<Admin> {
    const admin = await this.findById(id);

    admin.status = 'Active';
    admin.is_locked = false;
    admin.lock_reason = null as any;  // null assign করার এই পদ্ধতি
    admin.lock_expires_at = null as any;
    admin.locked_by = null as any;

    const updatedAdmin = await this.adminRepository.save(admin);

    return updatedAdmin;
  }


}
