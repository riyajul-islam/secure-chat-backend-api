import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { GpsTrackingService } from './gps-tracking.service';
import { CreateTrackingGroupDto } from './dto/create-tracking-group.dto';
import { AddParticipantDto } from './dto/add-participant.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { ProcessInviteDto } from './dto/process-invite.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('gps-tracking')
@Controller('gps-tracking')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GpsTrackingController {
  constructor(private readonly gpsTrackingService: GpsTrackingService) {}

  @Post('groups')
  @ApiOperation({ summary: 'Create a new tracking group' })
  @ApiResponse({ status: 201, description: 'Group created successfully' })
  createGroup(@Request() req, @Body() createDto: CreateTrackingGroupDto) {
    return this.gpsTrackingService.createGroup(req.user.id, createDto);
  }

  @Get('groups')
  @ApiOperation({ summary: 'Get all groups for current user' })
  @ApiResponse({ status: 200, description: 'Return user groups' })
  getUserGroups(@Request() req) {
    return this.gpsTrackingService.getUserGroups(req.user.id);
  }

  @Get('groups/:groupId')
  @ApiOperation({ summary: 'Get group details' })
  @ApiParam({ name: 'groupId' })
  getGroup(@Request() req, @Param('groupId') groupId: string) {
    return this.gpsTrackingService.getGroup(groupId, req.user.id);
  }

  @Post('groups/:groupId/participants')
  @ApiOperation({ summary: 'Add participant to group' })
  @ApiParam({ name: 'groupId' })
  addParticipant(
    @Request() req,
    @Param('groupId') groupId: string,
    @Body() addDto: AddParticipantDto,
  ) {
    return this.gpsTrackingService.addParticipant(groupId, req.user.id, addDto);
  }

  @Get('invites')
  @ApiOperation({ summary: 'Get pending invites for current user' })
  getPendingInvites(@Request() req) {
    return this.gpsTrackingService.getUserInvites(req.user.id);
  }

  @Patch('invites/:participantId')
  @ApiOperation({ summary: 'Process invite (accept/reject)' })
  @ApiParam({ name: 'participantId' })
  processInvite(
    @Request() req,
    @Param('participantId') participantId: string,
    @Body() processDto: ProcessInviteDto,
  ) {
    return this.gpsTrackingService.processInvite(participantId, req.user.id, processDto);
  }

  @Post('groups/:groupId/location')
  @ApiOperation({ summary: 'Update current location in group' })
  @ApiParam({ name: 'groupId' })
  updateLocation(
    @Request() req,
    @Param('groupId') groupId: string,
    @Body() locationDto: UpdateLocationDto,
  ) {
    return this.gpsTrackingService.updateLocation(req.user.id, groupId, locationDto);
  }

  @Get('groups/:groupId/locations')
  @ApiOperation({ summary: 'Get current locations of all group members' })
  @ApiParam({ name: 'groupId' })
  getGroupLocations(@Request() req, @Param('groupId') groupId: string) {
    return this.gpsTrackingService.getGroupLocations(groupId, req.user.id);
  }

  @Get('groups/:groupId/history')
  @ApiOperation({ summary: 'Get location history of group' })
  @ApiParam({ name: 'groupId' })
  @ApiQuery({ name: 'startTime', required: false })
  @ApiQuery({ name: 'endTime', required: false })
  getLocationHistory(
    @Request() req,
    @Param('groupId') groupId: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ) {
    return this.gpsTrackingService.getLocationHistory(
      groupId,
      req.user.id,
      startTime ? new Date(startTime) : undefined,
      endTime ? new Date(endTime) : undefined,
    );
  }

  @Post('groups/:groupId/end')
  @ApiOperation({ summary: 'End tracking group (host only)' })
  @ApiParam({ name: 'groupId' })
  endGroup(@Request() req, @Param('groupId') groupId: string) {
    return this.gpsTrackingService.endGroup(groupId, req.user.id);
  }

  @Post('groups/:groupId/leave')
  @ApiOperation({ summary: 'Leave tracking group' })
  @ApiParam({ name: 'groupId' })
  leaveGroup(@Request() req, @Param('groupId') groupId: string) {
    return this.gpsTrackingService.leaveGroup(groupId, req.user.id);
  }
}
