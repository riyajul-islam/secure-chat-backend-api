import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AdminsService } from '../admins/admins.service'; // ✅ ইম্পোর্ট যোগ করুন
import { Admin } from '../admins/entities/admin.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private adminsService: AdminsService, // ✅ Inject AdminsService
    private jwtService: JwtService,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password_hash)) {
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async validateAdmin(email: string, password: string): Promise<any> {
    const admin = await this.adminRepository.findOne({ 
      where: { email, status: 'Active' } 
    });
    
    if (admin && await bcrypt.compare(password, admin.password_hash)) {
      const { password_hash, ...result } = admin;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto, req?: any) { // ✅ Request object যোগ করুন
    const { email, password, isAdmin = false } = loginDto;
    
    let user: any;
    if (isAdmin) {
      user = await this.validateAdmin(email, password);
    } else {
      user = await this.validateUser(email, password);
    }
    
    if (!user) {
      // Failed login attempt record for admin (optional)
      if (isAdmin && req) {
        const admin = await this.adminRepository.findOne({ where: { email } });
        if (admin) {
          await this.adminsService.recordLogin(admin.id, req, 'failed', 'Invalid password');
        }
      }
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    if (isAdmin) {
      await this.adminRepository.update(user.id, { last_login: new Date() });
      
      // ✅ Record successful login history
      if (req) {
        await this.adminsService.recordLogin(user.id, req, 'success');
      }
    } else {
      await this.usersService.updateLastLogin(user.id);
    }

    const payload = { 
      sub: user.id, 
      email: user.email,
      role: isAdmin ? 'admin' : 'user',
      adminType: user.admin_type,
    };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '30d' }),
      user,
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const newPayload = { 
        sub: payload.sub, 
        email: payload.email,
        role: payload.role,
      };
      return {
        access_token: this.jwtService.sign(newPayload),
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}