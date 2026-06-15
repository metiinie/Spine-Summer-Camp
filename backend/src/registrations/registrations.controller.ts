import { Controller, Post, Get, Body, Query, UseGuards, Param, Res, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { RegistrationsService } from './registrations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { FindAllQueryDto } from './dto/find-all-query.dto';
import { AdminActionDto, AdminNoteDto } from './dto/admin-action.dto';

@Controller()
export class RegistrationsController {
  constructor(private readonly regService: RegistrationsService) {}

  // Public: submit a new registration — tightly rate-limited
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @Post('registrations')
  createRegistration(@Body() body: CreateRegistrationDto) {
    return this.regService.create(body);
  }

  // Public: status check by reference number or email
  @Throttle({ default: { ttl: 60000, limit: 20 } })
  @Get('registrations/status')
  checkStatus(@Query('q') query: string) {
    return this.regService.checkStatus(query);
  }

  // Public: limited payment details for the post-registration payment page
  @Throttle({ default: { ttl: 60000, limit: 30 } })
  @Get('registrations/payment/:id')
  getPaymentRegistration(@Param('id') id: string) {
    return this.regService.findPaymentInfo(id);
  }

  // Auth required: full registration detail
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Get('registrations/:id')
  getRegistration(@Param('id') id: string) {
    return this.regService.findOne(id);
  }

  // Admin: paginated list with optional status/search filters
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Get('admin/registrations')
  getRegistrations(@Query() query: FindAllQueryDto) {
    return this.regService.findAll(query);
  }

  // Admin: approve or reject with audit trail
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Post('admin/action')
  approveOrReject(@Body() body: AdminActionDto, @Req() req: Request) {
    const user = req.user as { userId: string };
    return this.regService.approveOrReject(body, user.userId);
  }

  // Admin: save internal note with audit trail
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Post('admin/note')
  saveAdminNote(@Body() body: AdminNoteDto, @Req() req: Request) {
    const user = req.user as { userId: string };
    return this.regService.saveNote(body, user.userId);
  }

  // Admin only: CSV export with audit trail
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/export')
  async exportCsv(@Res() res: Response, @Req() req: Request) {
    const user = req.user as { userId: string };
    const csv = await this.regService.generateCsvData(user.userId);
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', `attachment; filename="registrations-${Date.now()}.csv"`);
    res.send(csv);
  }
}
