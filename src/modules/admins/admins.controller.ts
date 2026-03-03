import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { PauseAdminDto, BanAdminDto } from './dto/admin-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('admins')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Post()
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminsService.create(createAdminDto);
  }

  @Get()
  findAll() {
    return this.adminsService.findAll();
  }

  // ⚠️ গুরুত্বপূর্ণ: specific routes আগে রাখতে হবে
  @Get('history/:id')
  async getLoginHistory(@Param('id') id: string, @Query('days') days?: string) {
    const daysNum = days ? parseInt(days) : 15;
    return this.adminsService.getLoginHistory(id, daysNum);
  }


  // ✅ generic routes পরে রাখতে হবে
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminsService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.adminsService.update(id, updateAdminDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminsService.remove(id);
  }

  @Post(':id/pause')
  async pauseAdmin(
    @Param('id') id: string,
    @Body() pauseDto: PauseAdminDto,
    @Request() req
  ) {
    return this.adminsService.pauseAdmin(id, pauseDto.reason, pauseDto.duration, req.user);
  }

  @Post(':id/ban')
  async banAdmin(
    @Param('id') id: string,
    @Body() banDto: BanAdminDto,
    @Request() req
  ) {
    return this.adminsService.banAdmin(id, banDto.reason, req.user);
  }

  @Post(':id/unban')
  async unbanAdmin(@Param('id') id: string, @Request() req) {
    return this.adminsService.unbanAdmin(id, req.user);
  }

  @Post(':id/sessions/:sessionId/terminate')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async terminateSession(
    @Param('id') id: string,
    @Param('sessionId') sessionId: string,
    @Request() req
  ) {
    return this.adminsService.terminateSession(id, sessionId, req.user);
    }


}