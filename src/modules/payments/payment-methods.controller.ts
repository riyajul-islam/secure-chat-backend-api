import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, Query 
} from '@nestjs/common';
import { 
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, 
  ApiQuery, ApiParam 
} from '@nestjs/swagger';
import { PaymentMethodsService } from './payment-methods.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { PaymentMethodType } from './entities/payment-method.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('payment-methods')
@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create payment method (Admin only)' })
  create(@Body() createDto: CreatePaymentMethodDto) {
    return this.paymentMethodsService.create(createDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all payment methods (Public)' })
  findAll() {
    return this.paymentMethodsService.findAll();
  }

  @Get('active')
  @Public()
  @ApiOperation({ summary: 'Get active payment methods (Public)' })
  findActive() {
    return this.paymentMethodsService.findActive();
  }

  @Get('type/:type')
  @Public()
  @ApiOperation({ summary: 'Get payment methods by type (Public)' })
  @ApiParam({ name: 'type', enum: PaymentMethodType, description: 'Payment method type' })
  findByType(@Param('type') type: PaymentMethodType) {
    return this.paymentMethodsService.findByType(type);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment method by ID (Admin only)' })
  findOne(@Param('id') id: string) {
    return this.paymentMethodsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update payment method (Admin only)' })
  update(@Param('id') id: string, @Body() updateDto: UpdatePaymentMethodDto) {
    return this.paymentMethodsService.update(id, updateDto);
  }

  @Patch(':id/toggle-status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle payment method status (Admin only)' })
  toggleStatus(@Param('id') id: string) {
    return this.paymentMethodsService.toggleStatus(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete payment method (Admin only)' })
  async remove(@Param('id') id: string) {
    await this.paymentMethodsService.remove(id);
    return { message: 'Payment method deleted successfully' };
  }
}