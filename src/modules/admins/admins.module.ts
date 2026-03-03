import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { AdminLoginHistory } from './entities/admin-login-history.entity';
import { AdminsService } from './admins.service';
import { AdminsController } from './admins.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Admin, 
      AdminLoginHistory
    ])
  ],
  controllers: [AdminsController],
  providers: [AdminsService],
  exports: [AdminsService, TypeOrmModule],
})
export class AdminsModule {}