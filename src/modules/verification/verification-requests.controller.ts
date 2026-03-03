import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, Query, Request 
} from '@nestjs/common';
import { 
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, 
  ApiQuery, ApiParam 
} from '@nestjs/swagger';
import { VerificationRequestsService } from './verification-requests.service';
import { VerificationEmailService } from './verification-email.service';
import { CreateVerificationRequestDto } from './dto/create-verification-request.dto';
import { ProcessVerificationRequestDto } from './dto/process-verification-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('verification-requests')
@Controller('verification-requests')
export class VerificationRequestsController {
  constructor(
    private readonly requestsService: VerificationRequestsService,
    private readonly emailService: VerificationEmailService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create verification request (User)' })
  async create(@Request() req, @Body() createDto: CreateVerificationRequestDto) {
    return await this.requestsService.create(req.user.id, createDto);
  }

  @Post(':id/start-email-verification')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start email verification process' })
  @ApiParam({ name: 'id' })
  async startEmailVerification(
    @Param('id') id: string,
    @Body('email') email: string,
  ) {
    await this.emailService.startEmailVerification(id, email);
    return { message: 'Verification code sent to email' };
  }

  @Post(':id/verify-email')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify email with code' })
  @ApiParam({ name: 'id' })
  async verifyEmail(
    @Param('id') id: string,
    @Body('code') code: string,
  ) {
    const verified = await this.emailService.verifyEmailCode(id, code);
    if (verified) {
      return { message: 'Email verified successfully', verified: true };
    }
    return { message: 'Invalid verification code', verified: false };
  }

  @Post(':id/resend-verification')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resend verification code' })
  @ApiParam({ name: 'id' })
  async resendVerification(@Param('id') id: string) {
    await this.emailService.resendVerificationCode(id);
    return { message: 'Verification code resent' };
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all verification requests (Admin only)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return await this.requestsService.findAll(page, limit, status as any);
  }

  @Get('my-requests')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user verification requests (User)' })
  async getMyRequests(@Request() req) {
    return await this.requestsService.getUserRequests(req.user.id);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get verification requests stats (Admin only)' })
  async getStats() {
    return await this.requestsService.getStats();
  }

  @Get('pending-count')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get pending requests count (Admin only)' })
  async getPendingCount() {
    const count = await this.requestsService.getPendingCount();
    return { pending: count };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get verification request by ID (Admin only)' })
  @ApiParam({ name: 'id' })
  async findOne(@Param('id') id: string) {
    return await this.requestsService.findOne(id);
  }

  @Patch(':id/process')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Process verification request (Admin only)' })
  @ApiParam({ name: 'id' })
  async processRequest(
    @Param('id') id: string,
    @Body() processDto: ProcessVerificationRequestDto,
    @Request() req,
  ) {
    return await this.requestsService.processRequest(id, processDto, req.user.id);
  }
}