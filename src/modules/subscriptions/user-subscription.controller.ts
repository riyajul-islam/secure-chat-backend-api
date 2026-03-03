import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, Request 
} from '@nestjs/common';
import { 
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, 
  ApiParam 
} from '@nestjs/swagger';
import { UserSubscriptionService } from './user-subscription.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('user-subscriptions')
@Controller('user-subscriptions')
export class UserSubscriptionController {
  constructor(private readonly subscriptionService: UserSubscriptionService) {}

  @Get('current')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user subscription (User)' })
  getCurrentSubscription(@Request() req) {
    return this.subscriptionService.getActiveSubscription(req.user.id);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user subscription history (User)' })
  getSubscriptionHistory(@Request() req) {
    return this.subscriptionService.getUserSubscriptions(req.user.id);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel subscription (User)' })
  cancelSubscription(@Param('id') id: string, @Request() req) {
    return this.subscriptionService.cancelSubscription(id, req.user.id);
  }

  @Post(':id/renew')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Renew subscription (User)' })
  renewSubscription(@Param('id') id: string) {
    return this.subscriptionService.renewSubscription(id);
  }
}
