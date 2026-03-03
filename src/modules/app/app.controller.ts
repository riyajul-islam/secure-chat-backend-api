import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
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

  @Get('api')
  getApiRoot() {
    return {
      message: 'API is running',
      endpoints: {
        health: '/api/health',
        auth: '/api/auth',
        users: '/api/users',
        admins: '/api/admins',
      },
    };
  }
}