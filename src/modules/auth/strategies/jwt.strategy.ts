import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../../admins/entities/admin.entity';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    const { sub, email, role } = payload;
    
    if (role === 'admin') {
      const admin = await this.adminRepository.findOne({ 
        where: { id: sub, status: 'Active' } 
      });
      if (!admin) {
        throw new UnauthorizedException();
      }
      return { id: admin.id, email: admin.email, role: 'admin', adminType: admin.admin_type };
    } else {
      const user = await this.usersService.findById(sub);
      if (!user || user.is_banned) {
        throw new UnauthorizedException();
      }
      return { id: user.id, email: user.email, role: 'user' };
    }
  }
}
