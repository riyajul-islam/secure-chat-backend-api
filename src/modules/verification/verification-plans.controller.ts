import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, Query, Request 
} from '@nestjs/common';
import { 
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, 
  ApiQuery, ApiParam 
} from '@nestjs/swagger';
import { VerificationPlansService } from './verification-plans.service';
import { CreateVerificationPlanDto } from './dto/create-verification-plan.dto';
import { UpdateVerificationPlanDto } from './dto/update-verification-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('verification-plans')
@Controller('verification-plans')
export class VerificationPlansController {
  constructor(private readonly plansService: VerificationPlansService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create verification plan (Admin only)' })
  async create(@Body() createDto: CreateVerificationPlanDto, @Request() req) {
    return await this.plansService.create(createDto, req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all verification plans (Admin only)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return await this.plansService.findAll(page, limit, status as any, search);
  }

  @Get('active')
  @Public()
  @ApiOperation({ summary: 'Get active verification plans (Public)' })
  async getActivePlans() {
    return await this.plansService.getActivePlans();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get verification plan by ID (Admin only)' })
  @ApiParam({ name: 'id' })
  async findOne(@Param('id') id: string) {
    return await this.plansService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update verification plan (Admin only)' })
  @ApiParam({ name: 'id' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateVerificationPlanDto, @Request() req) {
    return await this.plansService.update(id, updateDto, req.user.id);
  }

  @Patch(':id/toggle-status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle verification plan status (Admin only)' })
  @ApiParam({ name: 'id' })
  async toggleStatus(@Param('id') id: string, @Request() req) {
    return await this.plansService.toggleStatus(id, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete verification plan (Admin only)' })
  @ApiParam({ name: 'id' })
  async remove(@Param('id') id: string) {
    await this.plansService.remove(id);
    return { message: 'Verification plan deleted successfully' };
  }
}