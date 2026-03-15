import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { 
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, 
  ApiQuery 
} from '@nestjs/swagger';
import { AccountingService, TimeRange } from './accounting.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('accounting')
@Controller('accounting')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get accounting overview' })
  @ApiQuery({ name: 'range', enum: TimeRange, required: true })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getOverview(
    @Query('range') range: TimeRange,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.accountingService.getAccountingOverview(range, start, end);
  }

  @Get('plan-breakdown')
  @ApiOperation({ summary: 'Get plan-wise revenue breakdown' })
  @ApiQuery({ name: 'range', enum: TimeRange, required: true })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getPlanBreakdown(
    @Query('range') range: TimeRange,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.accountingService.getPlanWiseBreakdown(range, start, end);
  }

  @Get('top-users')
  @ApiOperation({ summary: 'Get top users by revenue' })
  @ApiQuery({ name: 'range', enum: TimeRange, required: true })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getTopUsers(
    @Query('range') range: TimeRange,
    @Query('limit') limit?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.accountingService.getTopUsers(range, limit || 10, start, end);
  }

  @Get('daily-revenue')
  @ApiOperation({ summary: 'Get daily revenue breakdown' })
  @ApiQuery({ name: 'range', enum: TimeRange, required: true })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getDailyRevenue(
    @Query('range') range: TimeRange,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.accountingService.getDailyRevenue(range, start, end);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get complete accounting summary report' })
  @ApiQuery({ name: 'range', enum: TimeRange, required: true })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getSummaryReport(
    @Query('range') range: TimeRange,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.accountingService.getSummaryReport(range, start, end);
  }
}