import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { UploadsController } from './uploads/uploads.controller';
import { EmailsService } from './emails/emails.service';
import { PrismaService } from './prisma.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    AuthModule,
    RegistrationsModule,
  ],
  controllers: [UploadsController, AppController],
  providers: [EmailsService, PrismaService, AppService],
})
export class AppModule {}
