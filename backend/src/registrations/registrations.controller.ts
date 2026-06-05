import { Controller, Post, Get, Body, Query, UseGuards, Res, Param } from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Response } from 'express';

@Controller()
export class RegistrationsController {
  constructor(private readonly regService: RegistrationsService) {}

  // Public Routes
  @Post('registrations')
  createRegistration(@Body() body: any) {
    return this.regService.create(body);
  }

  @Get('registrations/status')
  checkStatus(@Query('q') query: string) {
    return this.regService.checkStatus(query);
  }

  @Get('registrations/:id')
  getRegistration(@Param('id') id: string) {
    return this.regService.findOne(id);
  }

  // Admin Routes
  @UseGuards(JwtAuthGuard)
  @Get('admin/registrations')
  getRegistrations(@Query('status') status?: string, @Query('search') search?: string) {
    return this.regService.findAll(status, search);
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/action')
  approveOrReject(@Body() body: any) {
    return this.regService.approveOrReject(body.registrationId, body.action, body.rejectionReason);
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/note')
  saveAdminNote(@Body() body: any) {
    return this.regService.saveNote(body.registrationId, body.adminNote);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/export')
  async exportCsv(@Res() res: any) {
    const csv = await this.regService.generateCsv();
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', `attachment; filename="registrations-${Date.now()}.csv"`);
    res.send(csv);
  }
}
