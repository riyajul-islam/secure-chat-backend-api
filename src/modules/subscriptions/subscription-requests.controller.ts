import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, Query, Request 
} from '@nestjs/common';
import { 
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, 
  ApiQuery, ApiParam 
} from '@nestjs/swagger';
import { SubscriptionRequestsService } from './subscription-requests.service';
import { CreateSubscriptionRequestDto } from './dto/create-subscription-request.dto';
import { ProcessSubscriptionRequestDto } from './dto/process-subscription-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('subscription-requests')
@Controller('subscription-requests')
export class SubscriptionRequestsController {
  constructor(private readonly requestsService: SubscriptionRequestsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create subscription request (User)' })
  create(@Request() req, @Body() createDto: CreateSubscriptionRequestDto) {
    return this.requestsService.create(req.user.id, createDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all subscription requests (Admin only)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'approved', 'declined'] })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: any,
  ) {
    return this.requestsService.findAll(page, limit, status);
  }

  @Get('my-requests')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user requests (User)' })
  getMyRequests(@Request() req) {
    return this.requestsService.getUserRequests(req.user.id);
  }

  @Get('stats/pending-count')
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
  @ApiOperation({ summary: 'Get request by ID (Admin only)' })
  findOne(@Param('id') id: string) {
    return this.requestsService.findOne(id);
  }

  @Patch(':id/process')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Process subscription request (Admin only)' })
  processRequest(
    @Param('id') id: string,
    @Body() processDto: ProcessSubscriptionRequestDto,
    @Request() req,
  ) {
    return this.requestsService.processRequest(id, processDto, req.user.id);
  }
}
