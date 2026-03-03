import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AdminsService } from './modules/admins/admins.service';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const adminsService = app.get(AdminsService);

  try {
    // Check if admin exists
    const existingAdmin = await adminsService.findByEmail('admin@scratchwizard.net');
    
    if (!existingAdmin) {
      // Create default admin
      const defaultAdmin = {
        full_name: 'Super Admin',
        email: 'admin@scratchwizard.net',
        password: 'Admin@123',
        admin_type: 'Super Administrator',
        permissions: ['ALL'],
      };
      
      await adminsService.create(defaultAdmin);
      console.log('✅ Default admin created successfully!');
      console.log('📧 Email: admin@scratchwizard.net');
      console.log('🔑 Password: Admin@123');
    } else {
      console.log('ℹ️ Default admin already exists');
    }
  } catch (error) {
    console.error('❌ Error creating default admin:', error.message);
  }

  await app.close();
}

bootstrap();
