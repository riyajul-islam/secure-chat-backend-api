import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('root')
@Controller('/')
export class RootController {
  @Get()
  @ApiOperation({ summary: 'API root endpoint' })
  getRoot() {
    return {
      name: 'SecureChat API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      endpoints: {
        health: '/api/health',
        auth: {
          login: '/api/auth/login',
          adminLogin: '/api/auth/admin/login',
          refresh: '/api/auth/refresh',
        },
        users: '/api/users',
        admins: '/api/admins',
      },
      documentation: 'https://proappbackend.scratchwizard.net/api-docs',
    };
  }
}