import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, Query, Request 
} from '@nestjs/common';
import { 
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, 
  ApiQuery, ApiParam 
} from '@nestjs/swagger';
import { FundRequestsService } from './fund-requests.service';
import { CreateFundRequestDto } from './dto/create-fund-request.dto';
import { UpdateFundRequestStatusDto } from './dto/update-fund-request-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('fund-requests')
@Controller('fund-requests')
export class FundRequestsController {
  constructor(private readonly fundRequestsService: FundRequestsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create fund request (User)' })
  create(@Request() req, @Body() createDto: CreateFundRequestDto) {
    return this.fundRequestsService.create(req.user.id, createDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all fund requests (Admin only)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'approved', 'rejected'] })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: any,
  ) {
    return this.fundRequestsService.findAll(page, limit, status);
  }

  @Get('my-requests')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user fund requests (User)' })
  getMyRequests(@Request() req) {
    return this.fundRequestsService.getUserRequests(req.user.id);
  }

  @Get('stats/pending-count')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get pending requests count (Admin only)' })
  async getPendingCount() {
    const count = await this.fundRequestsService.getPendingCount();
    return { pending: count };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get fund request by ID (Admin only)' })
  findOne(@Param('id') id: string) {
    return this.fundRequestsService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update fund request status (Admin only)' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateFundRequestStatusDto,
    @Request() req,
  ) {
    return this.fundRequestsService.updateStatus(id, updateDto, req.user.id);
  }
}
